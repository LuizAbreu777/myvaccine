import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StockHistory, StockMovementType } from './stock-history.entity';
import { CreateStockHistoryDto } from './dto/stock-history.dto';

@Injectable()
export class StockHistoryService {
  constructor(
    @InjectRepository(StockHistory)
    private stockHistoryRepository: Repository<StockHistory>,
  ) {}

  async create(createStockHistoryDto: CreateStockHistoryDto): Promise<StockHistory> {
    const stockHistory = this.stockHistoryRepository.create(createStockHistoryDto);
    return await this.stockHistoryRepository.save(stockHistory);
  }

  async findAll(): Promise<StockHistory[]> {
    return await this.stockHistoryRepository.find({
      relations: ['post', 'vaccine', 'user'],
      order: { created_at: 'DESC' },
    });
  }

  async findByPost(postId: number): Promise<StockHistory[]> {
    return await this.stockHistoryRepository.find({
      where: { post_id: postId },
      relations: ['post', 'vaccine', 'user'],
      order: { created_at: 'DESC' },
    });
  }

  async findByVaccine(vaccineId: number): Promise<StockHistory[]> {
    return await this.stockHistoryRepository.find({
      where: { vaccine_id: vaccineId },
      relations: ['post', 'vaccine', 'user'],
      order: { created_at: 'DESC' },
    });
  }

  async findByMovementType(movementType: StockMovementType): Promise<StockHistory[]> {
    return await this.stockHistoryRepository.find({
      where: { movement_type: movementType },
      relations: ['post', 'vaccine', 'user'],
      order: { created_at: 'DESC' },
    });
  }

  async getRecentMovements(limit: number = 50): Promise<StockHistory[]> {
    return await this.stockHistoryRepository.find({
      relations: ['post', 'vaccine', 'user'],
      order: { created_at: 'DESC' },
      take: limit,
    });
  }

  async getMovementsByDateRange(startDate: Date, endDate: Date): Promise<StockHistory[]> {
    return await this.stockHistoryRepository
      .createQueryBuilder('stockHistory')
      .leftJoinAndSelect('stockHistory.post', 'post')
      .leftJoinAndSelect('stockHistory.vaccine', 'vaccine')
      .leftJoinAndSelect('stockHistory.user', 'user')
      .where('stockHistory.created_at BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      })
      .orderBy('stockHistory.created_at', 'DESC')
      .getMany();
  }

  async getSummaryStats(): Promise<{
    totalEntries: number;
    totalExits: number;
    totalAdjustments: number;
    totalExpired: number;
    totalTransfers: number;
  }> {
    const stats = await this.stockHistoryRepository
      .createQueryBuilder('stockHistory')
      .select('stockHistory.movement_type', 'movement_type')
      .addSelect('COUNT(*)', 'count')
      .groupBy('stockHistory.movement_type')
      .getRawMany();

    const result = {
      totalEntries: 0,
      totalExits: 0,
      totalAdjustments: 0,
      totalExpired: 0,
      totalTransfers: 0,
    };

    stats.forEach((stat) => {
      switch (stat.movement_type) {
        case StockMovementType.ENTRY:
          result.totalEntries = parseInt(stat.count);
          break;
        case StockMovementType.EXIT:
          result.totalExits = parseInt(stat.count);
          break;
        case StockMovementType.ADJUSTMENT:
          result.totalAdjustments = parseInt(stat.count);
          break;
        case StockMovementType.EXPIRED:
          result.totalExpired = parseInt(stat.count);
          break;
        case StockMovementType.TRANSFER:
          result.totalTransfers = parseInt(stat.count);
          break;
      }
    });

    return result;
  }
}
