import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Dependent } from "./dependent.entity";
import { CreateDependentDto, UpdateDependentDto } from "./dto/dependent.dto";

@Injectable()
export class DependentsService {
  constructor(
    @InjectRepository(Dependent)
    private readonly dependentRepository: Repository<Dependent>
  ) {}

  async create(
    createDependentDto: CreateDependentDto,
    userCpf: string
  ): Promise<Dependent> {
    // Função auxiliar para normalizar CPF (remove pontos e traços)
    const normalizeCPF = (cpf: string) => {
      if (!cpf) return "";
      return cpf.replace(/[.-]/g, "").trim();
    };

    // Normalizar CPFs antes de salvar
    const normalizedCpf = normalizeCPF(createDependentDto.cpf);
    const normalizedUserCpf = normalizeCPF(userCpf);

    if (!normalizedCpf || normalizedCpf.length !== 11) {
      throw new ConflictException("CPF do dependente inválido");
    }

    if (!normalizedUserCpf || normalizedUserCpf.length !== 11) {
      throw new ConflictException("CPF do usuário inválido");
    }

    // Verificar se o CPF já existe (buscar em ambos os formatos)
    const existing = await this.findByCpf(normalizedCpf);

    if (existing) {
      throw new ConflictException("CPF já cadastrado");
    }

    const dependent = this.dependentRepository.create({
      ...createDependentDto,
      cpf: normalizedCpf, // Sempre salvar CPF normalizado
      dob: new Date(createDependentDto.dob),
      user_cpf: normalizedUserCpf, // Sempre salvar user_cpf normalizado
    });

    return await this.dependentRepository.save(dependent);
  }

  async findAllByUser(userCpf: string): Promise<Dependent[]> {
    // Normalizar CPF para buscar em ambos os formatos
    const normalizeCPF = (cpf: string) => cpf.replace(/[.-]/g, '');
    const formatCPF = (cpf: string) => {
      const normalized = normalizeCPF(cpf);
      if (normalized.length === 11) {
        return normalized.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
      }
      return cpf;
    };

    const normalized = normalizeCPF(userCpf);
    const formatted = formatCPF(normalized);

    // Buscar dependentes com join na relação user para garantir dados nested
    const allDependents = await this.dependentRepository.find({
      relations: ["user"],
      order: { created_at: "DESC" },
    });

    // Filtrar dependentes cujo user_cpf normalizado corresponde ao CPF do usuário
    const normalizedUserCpf = normalized;
    const dependents = allDependents.filter(dependent => {
      const dependentUserCpfNormalized = normalizeCPF(dependent.user_cpf);
      return dependentUserCpfNormalized === normalizedUserCpf;
    });

    return dependents;
  }

  async findOne(cpf: string, userCpf: string): Promise<Dependent> {
    // Normalizar CPFs para buscar
    const normalizeCPF = (cpf: string) => {
      if (!cpf) return "";
      return cpf.replace(/[.-]/g, "").trim();
    };

    const normalizedCpf = normalizeCPF(cpf);
    const normalizedUserCpf = normalizeCPF(userCpf);

    // Buscar com CPF normalizado
    const dependent = await this.dependentRepository.findOne({
      where: { cpf: normalizedCpf, user_cpf: normalizedUserCpf },
    });

    if (!dependent) {
      throw new NotFoundException("Dependente não encontrado");
    }

    return dependent;
  }

  async update(
    cpf: string,
    updateDependentDto: UpdateDependentDto,
    userCpf: string
  ): Promise<Dependent> {
    const dependent = await this.findOne(cpf, userCpf);

    if (updateDependentDto.name !== undefined) {
      dependent.name = updateDependentDto.name;
    }

    if (updateDependentDto.dob !== undefined) {
      dependent.dob = new Date(updateDependentDto.dob);
    }

    if (updateDependentDto.relationship !== undefined) {
      dependent.relationship = updateDependentDto.relationship;
    }

    return await this.dependentRepository.save(dependent);
  }

  async remove(cpf: string, userCpf: string): Promise<void> {
    // findOne já normaliza os CPFs
    const dependent = await this.findOne(cpf, userCpf);
    await this.dependentRepository.remove(dependent);
  }

  async findByCpf(cpf: string): Promise<Dependent | null> {
    // Normalizar CPF (remover pontos e traços)
    const normalizeCPF = (cpf: string) => cpf.replace(/[.-]/g, '');
    const formatCPF = (cpf: string) => {
      const normalized = normalizeCPF(cpf);
      if (normalized.length === 11) {
        return normalized.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
      }
      return cpf;
    };

    const normalized = normalizeCPF(cpf);
    const formatted = formatCPF(normalized);

    // Tenta encontrar com CPF formatado primeiro
    let dependent = await this.dependentRepository.findOne({
      where: { cpf: formatted },
    });
    
    // Se não encontrou, tenta sem formatação
    if (!dependent && normalized.length === 11) {
      dependent = await this.dependentRepository.findOne({
        where: { cpf: normalized },
      });
    }

    return dependent;
  }

  /**
   * Método para normalizar todos os CPFs existentes no banco de dados
   * Remove pontos e traços dos CPFs e user_cpf de todos os dependentes
   */
  async normalizeAllCpfs(): Promise<{ updated: number; errors: string[] }> {
    const normalizeCPF = (cpf: string) => {
      if (!cpf) return "";
      return cpf.replace(/[.-]/g, "").trim();
    };

    const errors: string[] = [];
    let updated = 0;

    try {
      // Buscar todos os dependentes
      const allDependents = await this.dependentRepository.find();

      for (const dependent of allDependents) {
        const normalizedCpf = normalizeCPF(dependent.cpf);
        const normalizedUserCpf = normalizeCPF(dependent.user_cpf);

        // Verificar se precisa atualizar
        if (
          normalizedCpf !== dependent.cpf ||
          normalizedUserCpf !== dependent.user_cpf
        ) {
          // Verificar se já existe outro dependente com o CPF normalizado
          const existing = await this.dependentRepository.findOne({
            where: { cpf: normalizedCpf },
          });

          if (existing && existing.cpf !== dependent.cpf) {
            errors.push(
              `Conflito: CPF ${dependent.cpf} (normalizado: ${normalizedCpf}) já existe`
            );
            continue;
          }

          // Atualizar CPFs normalizados
          dependent.cpf = normalizedCpf;
          dependent.user_cpf = normalizedUserCpf;
          await this.dependentRepository.save(dependent);
          updated++;
        }
      }

      return { updated, errors };
    } catch (error) {
      errors.push(`Erro ao normalizar CPFs: ${error.message}`);
      return { updated, errors };
    }
  }
}

