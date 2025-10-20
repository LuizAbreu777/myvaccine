import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vaccine } from './vaccine.entity';
import { CreateVaccineDto, UpdateVaccineDto } from './dto/vaccine.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { UserRole } from '../users/user.entity';

@Controller('vaccines')
@UseGuards(JwtAuthGuard, RolesGuard)
export class VaccineController {
  constructor(
    @InjectRepository(Vaccine)
    private vaccineRepository: Repository<Vaccine>,
  ) {}

  @Post()
  @Roles(UserRole.ADMIN)
  async create(@Body() createVaccineDto: CreateVaccineDto) {
    const vaccine = this.vaccineRepository.create(createVaccineDto);
    return this.vaccineRepository.save(vaccine);
  }

  @Get()
  async findAll() {
    return this.vaccineRepository.find({
      order: { id: 'DESC' }
    });
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.vaccineRepository.findOne({ where: { id: +id } });
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  async update(@Param('id') id: string, @Body() updateVaccineDto: UpdateVaccineDto) {
    await this.vaccineRepository.update(id, updateVaccineDto);
    return this.vaccineRepository.findOne({ where: { id: +id } });
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  async remove(@Param('id') id: string) {
    await this.vaccineRepository.delete(id);
    return { message: 'Vacina removida com sucesso' };
  }
}
