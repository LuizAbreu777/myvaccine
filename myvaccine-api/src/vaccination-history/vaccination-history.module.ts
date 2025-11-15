import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VaccinationHistoryController } from './vaccination-history.controller';
import { VaccinationHistory } from './vaccination-history.entity';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([VaccinationHistory]),
    UsersModule,
  ],
  controllers: [VaccinationHistoryController],
})
export class VaccinationHistoryModule {}
