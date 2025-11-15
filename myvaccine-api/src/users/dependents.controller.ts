import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { Roles } from "../common/decorators/roles.decorator";
import { RolesGuard } from "../common/guards/roles.guard";
import { UserRole } from "./user.entity";
import { DependentsService } from "./dependents.service";
import { CreateDependentDto, UpdateDependentDto } from "./dto/dependent.dto";

@Controller("dependents")
@UseGuards(JwtAuthGuard, RolesGuard)
export class DependentsController {
  constructor(private readonly dependentsService: DependentsService) {}

  @Post()
  async create(@Body() createDependentDto: CreateDependentDto, @Request() req) {
    const userCpf = req.user?.cpf;
    if (!userCpf) {
      throw new UnauthorizedException("CPF do usuário não encontrado na requisição");
    }
    return await this.dependentsService.create(createDependentDto, userCpf);
  }

  @Get()
  async findAll(@Request() req) {
    const userCpf = req.user?.cpf;
    if (!userCpf) {
      throw new UnauthorizedException("CPF do usuário não encontrado na requisição");
    }
    return await this.dependentsService.findAllByUser(userCpf);
  }

  @Get("check/:cpf")
  async checkCpf(@Param("cpf") cpf: string) {
    const dependent = await this.dependentsService.findByCpf(cpf);
    if (dependent) {
      return {
        isDependent: true,
        name: dependent.name,
        relationship: dependent.relationship,
      };
    }
    return { isDependent: false };
  }

  @Get(":cpf")
  async findOne(@Param("cpf") cpf: string, @Request() req) {
    const userCpf = req.user?.cpf;
    if (!userCpf) {
      throw new UnauthorizedException("CPF do usuário não encontrado na requisição");
    }
    return await this.dependentsService.findOne(cpf, userCpf);
  }

  @Put(":cpf")
  async update(
    @Param("cpf") cpf: string,
    @Body() updateDependentDto: UpdateDependentDto,
    @Request() req
  ) {
    const userCpf = req.user?.cpf;
    if (!userCpf) {
      throw new UnauthorizedException("CPF do usuário não encontrado na requisição");
    }
    return await this.dependentsService.update(
      cpf,
      updateDependentDto,
      userCpf
    );
  }

  @Delete(":cpf")
  async remove(@Param("cpf") cpf: string, @Request() req) {
    const userCpf = req.user?.cpf;
    if (!userCpf) {
      throw new UnauthorizedException("CPF do usuário não encontrado na requisição");
    }
    await this.dependentsService.remove(cpf, userCpf);
    return { message: "Dependente excluído com sucesso" };
  }

  @Post("normalize-cpfs")
  @Roles(UserRole.ADMIN)
  async normalizeCpfs() {
    return await this.dependentsService.normalizeAllCpfs();
  }
}

