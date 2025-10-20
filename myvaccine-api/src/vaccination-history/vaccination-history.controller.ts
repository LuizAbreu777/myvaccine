import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { Roles } from "../common/decorators/roles.decorator";
import { RolesGuard } from "../common/guards/roles.guard";
import { UserRole } from "../users/user.entity";
import { CreateVaccinationHistoryDto } from "./dto/vaccination-history.dto";
import { VaccinationHistory } from "./vaccination-history.entity";

@Controller("vaccination-history")
@UseGuards(JwtAuthGuard, RolesGuard)
export class VaccinationHistoryController {
  constructor(
    @InjectRepository(VaccinationHistory)
    private vaccinationHistoryRepository: Repository<VaccinationHistory>
  ) {}

  @Post()
  @Roles(UserRole.ADMIN)
  async create(
    @Body() createVaccinationHistoryDto: CreateVaccinationHistoryDto
  ) {
    const vaccinationHistory = this.vaccinationHistoryRepository.create({
      ...createVaccinationHistoryDto,
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
    return this.vaccinationHistoryRepository.find({
      relations: ["user", "vaccine", "post"],
      order: { application_date: "DESC" },
    });
  }

  @Get("user/:cpf")
  async findByUser(@Param("cpf") cpf: string) {
    return this.vaccinationHistoryRepository.find({
      where: { user_cpf: cpf },
      relations: ["vaccine", "post"],
      order: { application_date: "DESC" },
    });
  }

  @Get(":id")
  async findOne(@Param("id") id: string) {
    return this.vaccinationHistoryRepository.findOne({
      where: { id: +id },
      relations: ["user", "vaccine", "post"],
    });
  }
}
