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
import { UsersService } from "./users.service";
import { CreateDependentDto, UpdateDependentDto } from "./dto/dependent.dto";
import { use } from "passport";

@Controller("dependents")
@UseGuards(JwtAuthGuard, RolesGuard)
export class DependentsController {
  constructor(
    private readonly dependentsService: DependentsService,
    private readonly usersService: UsersService,
  ) {}

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
    // Primeiro verifica se é dependente
    const dependent = await this.dependentsService.findByCpf(cpf);
    if (dependent) {
      return {
        exists: true,
        type: 'dependent',
        isDependent: true,
        name: dependent.name,
        relationship: dependent.relationship,
      };
    }

    // Se não for dependente, verifica se é usuário
    try {
      const user = await this.usersService.findByCpf(cpf);
      if (user) {
        return {
          exists: true,
          type: 'user',
          isDependent: false,
          name: user.name,
        };
      }
    } catch (error) {
      // Usuário não encontrado
    }

    // CPF não existe no banco
    return { 
      exists: false, 
      type: null,
      isDependent: false 
    };
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

