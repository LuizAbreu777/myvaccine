import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { Dependent } from './dependent.entity';
import { DependentsService } from './dependents.service';
import { DependentsController } from './dependents.controller';

@Module({
  imports: [TypeOrmModule.forFeature([User, Dependent])],
  providers: [UsersService, DependentsService],
  controllers: [UsersController, DependentsController],
  exports: [TypeOrmModule, UsersService, DependentsService],
})
export class UsersModule {}
