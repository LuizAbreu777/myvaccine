import {
  BadRequestException,
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  UseGuards,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { Roles } from "../common/decorators/roles.decorator";
import { RolesGuard } from "../common/guards/roles.guard";
import { DependentsService } from "../users/dependents.service";
import { UserRole } from "../users/user.entity";
import { UsersService } from "../users/users.service";
import { CreateVaccinationHistoryDto } from "./dto/vaccination-history.dto";
import { VaccinationHistory } from "./vaccination-history.entity";

@Controller("vaccination-history")
@UseGuards(JwtAuthGuard, RolesGuard)
export class VaccinationHistoryController {
  constructor(
    @InjectRepository(VaccinationHistory)
    private vaccinationHistoryRepository: Repository<VaccinationHistory>,
    private usersService: UsersService,
    private dependentsService: DependentsService
  ) {}

  @Post()
  @Roles(UserRole.ADMIN)
  async create(
    @Body() createVaccinationHistoryDto: CreateVaccinationHistoryDto
  ) {
    // Função auxiliar para normalizar CPF (remove pontos e traços)
    const normalizeCPF = (cpf: string) => {
      if (!cpf) return "";
      return cpf.replace(/[.-]/g, "").trim();
    };

    // Normalizar CPF recebido
    const normalizedCpf = normalizeCPF(createVaccinationHistoryDto.user_cpf);

    if (!normalizedCpf || normalizedCpf.length !== 11) {
      throw new BadRequestException("CPF inválido");
    }

    // Detectar automaticamente se é User ou Dependent
    let isDependent = false;
    let finalCpf = normalizedCpf;

    // Primeiro tenta encontrar como User
    try {
      await this.usersService.findByCpf(normalizedCpf);
      isDependent = false;
    } catch (error) {
      // Se não encontrou como User, tenta como Dependent
      const dependent = await this.dependentsService.findByCpf(normalizedCpf);
      if (dependent) {
        isDependent = true;
        // Usa o CPF normalizado (sem formatação) para garantir consistência
        finalCpf = normalizeCPF(dependent.cpf);
      } else {
        throw new NotFoundException(
          "Usuário ou dependente não encontrado com este CPF"
        );
      }
    }

    const vaccinationHistory = this.vaccinationHistoryRepository.create({
      ...createVaccinationHistoryDto,
      user_cpf: finalCpf, // Sempre salvar CPF normalizado
      is_dependent: isDependent,
      application_date:
        createVaccinationHistoryDto.application_date || new Date(),
    });

    const saved = await this.vaccinationHistoryRepository.save(
      vaccinationHistory
    );

    // Decrementar estoque
    // Esta lógica deveria estar em um service dedicado
    return saved;
  }

  @Get()
  @Roles(UserRole.ADMIN)
  async findAll() {
    // Usar joins do TypeORM para trazer dados nested
    const histories = await this.vaccinationHistoryRepository
      .createQueryBuilder("vh")
      .leftJoinAndSelect("vh.user", "user")
      .leftJoinAndSelect("vh.dependent", "dependent")
      .leftJoinAndSelect("dependent.user", "dependentUser")
      .leftJoinAndSelect("vh.vaccine", "vaccine")
      .leftJoinAndSelect("vh.post", "post")
      .orderBy("vh.application_date", "DESC")
      .getMany();

    return histories;
  }

  @Get("user/:cpf")
  async findByUser(@Param("cpf") cpf: string) {
    // Normalizar CPF para garantir busca correta
    const normalizeCPF = (cpf: string) => {
      if (!cpf) return "";
      return cpf.replace(/[.-]/g, "").trim();
    };

    const normalizedCpf = normalizeCPF(cpf);

    // Usar joins do TypeORM para trazer dados nested
    // Buscar apenas vacinas do usuário (não dependentes)
    const histories = await this.vaccinationHistoryRepository
      .createQueryBuilder("vh")
      .leftJoinAndSelect("vh.user", "user")
      .leftJoinAndSelect("vh.dependent", "dependent")
      .leftJoinAndSelect("vh.vaccine", "vaccine")
      .leftJoinAndSelect("vh.post", "post")
      .where("vh.is_dependent = :isDependent", { isDependent: false })
      .andWhere("vh.user_cpf = :cpf", { cpf: normalizedCpf })
      .orderBy("vh.application_date", "DESC")
      .getMany();

    return histories;
  }

  @Get("user/:cpf/all")
  async findByUserAll(@Param("cpf") cpf: string) {
    // Função auxiliar para normalizar CPF (remove pontos e traços)
    const normalizeCPF = (cpf: string) => {
      if (!cpf) return "";
      return cpf.replace(/[.-]/g, "").trim();
    };

    const normalizedCpf = normalizeCPF(cpf);

    if (!normalizedCpf || normalizedCpf.length !== 11) {
      return [];
    }

    // Buscar dependentes do usuário
    const dependents = await this.dependentsService.findAllByUser(cpf);

    // Extrair CPFs normalizados dos dependentes
    const dependentCpfs = dependents
      .map((d) => normalizeCPF(d.cpf))
      .filter((normalized) => normalized && normalized.length === 11);

    // Criar lista de CPFs para buscar (usuário + dependentes)
    const allCpfs = [normalizedCpf, ...dependentCpfs];

    // Buscar todas as vacinas (do usuário e dos dependentes) em uma única query
    const histories = await this.vaccinationHistoryRepository
      .createQueryBuilder("vh")
      .leftJoinAndSelect("vh.user", "user")
      .leftJoinAndSelect("vh.dependent", "dependent")
      .leftJoinAndSelect("dependent.user", "dependentUser")
      .leftJoinAndSelect("vh.vaccine", "vaccine")
      .leftJoinAndSelect("vh.post", "post")
      .where("vh.user_cpf IN (:...cpfs)", { cpfs: allCpfs })
      .orderBy("vh.application_date", "DESC")
      .getMany();

    // Garantir que os dependentes estão associados corretamente
    const dependentMap = new Map<string, any>();
    dependents.forEach((d) => {
      const normalized = normalizeCPF(d.cpf);
      if (normalized && normalized.length === 11) {
        dependentMap.set(normalized, d);
      }
    });

    // Associar dependentes manualmente quando necessário
    for (const history of histories) {
      if (history.is_dependent && history.user_cpf && !history.dependent) {
        const historyCpfNormalized = normalizeCPF(history.user_cpf);
        const dependent = dependentMap.get(historyCpfNormalized);
        if (dependent) {
          history.dependent = dependent;
        }
      }
    }

    return histories;
  }

  @Get("user/:cpf/dependents")
  async findByUserDependents(@Param("cpf") cpf: string) {
    // Função auxiliar para normalizar CPF (remove pontos e traços)
    const normalizeCPF = (cpf: string) => {
      if (!cpf) return "";
      return cpf.replace(/[.-]/g, "").trim();
    };

    // Normalizar CPF do usuário recebido
    const normalizedUserCpf = normalizeCPF(cpf);

    if (!normalizedUserCpf || normalizedUserCpf.length !== 11) {
      return [];
    }

    // Buscar dependentes do usuário (já retorna CPFs normalizados)
    const dependents = await this.dependentsService.findAllByUser(cpf);

    // Se não encontrou dependentes, retornar vazio
    if (!dependents || dependents.length === 0) {
      return [];
    }

    // Extrair CPFs normalizados dos dependentes (já devem estar normalizados)
    const dependentCpfs = dependents
      .map((d) => normalizeCPF(d.cpf))
      .filter((normalized) => normalized && normalized.length === 11);

    if (dependentCpfs.length === 0) {
      return [];
    }

    // Usar joins do TypeORM para trazer dados nested (igual à rota de admin):
    // VaccinationHistory -> Dependent -> User
    // VaccinationHistory -> Vaccine
    // VaccinationHistory -> Post
    // Importante: fazer o join com a tabela dependents explicitamente
    const histories = await this.vaccinationHistoryRepository
      .createQueryBuilder("vh")
      .leftJoinAndSelect("vh.dependent", "dependent")
      .leftJoinAndSelect("dependent.user", "dependentUser")
      .leftJoinAndSelect("vh.vaccine", "vaccine")
      .leftJoinAndSelect("vh.post", "post")
      .where("vh.is_dependent = :isDependent", { isDependent: true })
      .andWhere("vh.user_cpf IN (:...cpfs)", { cpfs: dependentCpfs })
      .orderBy("vh.application_date", "DESC")
      .getMany();

    // Garantir que os dependentes estão associados corretamente
    // Criar um mapa de CPF -> Dependent para garantir associação
    const dependentMap = new Map<string, any>();
    dependents.forEach((d) => {
      const normalized = normalizeCPF(d.cpf);
      if (normalized && normalized.length === 11) {
        dependentMap.set(normalized, d);
      }
    });

    // Associar dependentes manualmente (o join pode não funcionar com filtros WHERE)
    // Isso garante que sempre temos os dados nested corretos
    for (const history of histories) {
      if (history.user_cpf) {
        const historyCpfNormalized = normalizeCPF(history.user_cpf);
        const dependent = dependentMap.get(historyCpfNormalized);
        if (dependent) {
          // Associar o dependente completo (já vem com user carregado)
          history.dependent = dependent;
        }
      }
    }

    return histories;
  }

  @Get("debug/user/:cpf")
  async debugUserDependents(@Param("cpf") cpf: string) {
    // Endpoint de debug para verificar dados
    const normalizeCPF = (cpf: string) => {
      if (!cpf) return "";
      return cpf.replace(/[.-]/g, "").trim();
    };

    const normalizedCpf = normalizeCPF(cpf);

    // Buscar dependentes
    const dependents = await this.dependentsService.findAllByUser(cpf);

    // Buscar todas as vacinas de dependentes
    const allDependentHistories = await this.vaccinationHistoryRepository
      .createQueryBuilder("vh")
      .leftJoinAndSelect("vh.vaccine", "vaccine")
      .leftJoinAndSelect("vh.post", "post")
      .where("vh.is_dependent = :isDependent", { isDependent: true })
      .getMany();

    // Criar Set de CPFs normalizados dos dependentes
    const dependentCpfsNormalized = new Set<string>();
    dependents.forEach((d) => {
      const normalized = normalizeCPF(d.cpf);
      if (normalized && normalized.length === 11) {
        dependentCpfsNormalized.add(normalized);
      }
    });

    // Filtrar vacinas que correspondem aos dependentes
    const matchingHistories = allDependentHistories.filter((h) => {
      const historyCpfNormalized = normalizeCPF(h.user_cpf);
      return (
        historyCpfNormalized.length === 11 &&
        dependentCpfsNormalized.has(historyCpfNormalized)
      );
    });

    return {
      userCpf: {
        original: cpf,
        normalized: normalizedCpf,
      },
      dependentsFound: dependents.length,
      dependents: dependents.map((d) => ({
        cpf: d.cpf,
        cpfNormalized: normalizeCPF(d.cpf),
        name: d.name,
        relationship: d.relationship,
        user_cpf: d.user_cpf,
        user_cpfNormalized: normalizeCPF(d.user_cpf),
      })),
      allDependentVaccinationsCount: allDependentHistories.length,
      allDependentVaccinations: allDependentHistories.map((h) => ({
        id: h.id,
        user_cpf: h.user_cpf,
        user_cpfNormalized: normalizeCPF(h.user_cpf),
        is_dependent: h.is_dependent,
        vaccine: h.vaccine?.name,
        application_date: h.application_date,
        matchesDependent: dependentCpfsNormalized.has(normalizeCPF(h.user_cpf)),
      })),
      matchingHistoriesCount: matchingHistories.length,
      matchingHistories: matchingHistories.map((h) => ({
        id: h.id,
        user_cpf: h.user_cpf,
        vaccine: h.vaccine?.name,
        application_date: h.application_date,
      })),
    };
  }

  @Get(":id")
  async findOne(@Param("id") id: string) {
    // Usar joins do TypeORM para trazer dados nested
    const history = await this.vaccinationHistoryRepository
      .createQueryBuilder("vh")
      .leftJoinAndSelect("vh.user", "user")
      .leftJoinAndSelect("vh.dependent", "dependent")
      .leftJoinAndSelect("dependent.user", "dependentUser")
      .leftJoinAndSelect("vh.vaccine", "vaccine")
      .leftJoinAndSelect("vh.post", "post")
      .where("vh.id = :id", { id: +id })
      .getOne();

    return history;
  }
}
