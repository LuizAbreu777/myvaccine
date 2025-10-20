import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StockController } from './stock.controller';
import { StockService } from './stock.service';
import { Stock } from './stock.entity';
import { StockHistory } from './stock-history.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Stock, StockHistory])],
  controllers: [StockController],
  providers: [StockService],
  exports: [StockService],
})
export class StocksModule {}
