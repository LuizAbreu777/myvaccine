import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeedService } from './seed.service';
import { StockHistorySeedService } from './stock-history-seed.service';
import { User } from '../users/user.entity';
import { Vaccine } from '../vaccines/vaccine.entity';
import { Post } from '../posts/post.entity';
import { Stock } from '../stocks/stock.entity';
import { StockHistory } from '../stocks/stock-history.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Vaccine, Post, Stock, StockHistory]),
  ],
  providers: [SeedService, StockHistorySeedService],
  exports: [SeedService, StockHistorySeedService],
})
export class SeedModule {}
