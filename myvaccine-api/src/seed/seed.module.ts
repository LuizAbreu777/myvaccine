import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeedService } from './seed.service';
import { StockHistorySeedService } from './stock-history-seed.service';
import { DependentsSeedService } from './dependents-seed.service';
import { User } from '../users/user.entity';
import { Vaccine } from '../vaccines/vaccine.entity';
import { Post } from '../posts/post.entity';
import { Stock } from '../stocks/stock.entity';
import { StockHistory } from '../stocks/stock-history.entity';
import { Dependent } from '../users/dependent.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Vaccine, Post, Stock, StockHistory, Dependent]),
  ],
  providers: [SeedService, StockHistorySeedService, DependentsSeedService],
  exports: [SeedService, StockHistorySeedService, DependentsSeedService],
})
export class SeedModule {}
