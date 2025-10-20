import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VaccinationHistoryController } from './vaccination-history.controller';
import { VaccinationHistory } from './vaccination-history.entity';

@Module({
  imports: [TypeOrmModule.forFeature([VaccinationHistory])],
  controllers: [VaccinationHistoryController],
})
export class VaccinationHistoryModule {}
