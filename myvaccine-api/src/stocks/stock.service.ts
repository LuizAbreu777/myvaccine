import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Stock } from './stock.entity';
import { StockHistory, StockMovementType } from './stock-history.entity';
import { CreateStockDto, UpdateStockDto } from './dto/stock.dto';
import { CreateStockHistoryDto } from './dto/stock-history.dto';

@Injectable()
export class StockService {
  constructor(
    @InjectRepository(Stock)
    private stockRepository: Repository<Stock>,
    @InjectRepository(StockHistory)
    private stockHistoryRepository: Repository<StockHistory>,
  ) {}

  async create(createStockDto: CreateStockDto, userId?: string): Promise<Stock> {
    const stock = this.stockRepository.create(createStockDto);
    const savedStock = await this.stockRepository.save(stock);

    // Registrar entrada no histórico
    const historyDto: CreateStockHistoryDto = {
      post_id: createStockDto.post_id,
      vaccine_id: createStockDto.vaccine_id,
      user_id: userId,
      movement_type: StockMovementType.ENTRY,
      quantity_change: createStockDto.quantity,
      quantity_before: 0,
      quantity_after: createStockDto.quantity,
      batch: createStockDto.batch,
      expiration_date: createStockDto.expiration_date,
      reason: 'Entrada inicial de estoque',
      notes: 'Criação de novo item de estoque',
    };

    await this.stockHistoryRepository.save(historyDto);

    return savedStock;
  }

  async update(id: number, updateStockDto: UpdateStockDto, userId?: string): Promise<Stock> {
    const currentStock = await this.stockRepository.findOne({ where: { id } });
    if (!currentStock) {
      throw new Error('Estoque não encontrado');
    }

    const quantityBefore = currentStock.quantity;
    const quantityAfter = updateStockDto.quantity || currentStock.quantity;
    const quantityChange = quantityAfter - quantityBefore;

    // Atualizar estoque
    await this.stockRepository.update(id, updateStockDto);
    const updatedStock = await this.stockRepository.findOne({ where: { id } });

    // Registrar movimentação no histórico
    if (quantityChange !== 0) {
      const movementType = quantityChange > 0 ? StockMovementType.ENTRY : StockMovementType.EXIT;
      
      const historyDto: CreateStockHistoryDto = {
        post_id: currentStock.post_id,
        vaccine_id: currentStock.vaccine_id,
        user_id: userId,
        movement_type: movementType,
        quantity_change: Math.abs(quantityChange),
        quantity_before: quantityBefore,
        quantity_after: quantityAfter,
        batch: updateStockDto.batch || currentStock.batch,
        expiration_date: updateStockDto.expiration_date || currentStock.expiration_date.toString(),
        reason: quantityChange > 0 ? 'Ajuste de entrada' : 'Ajuste de saída',
        notes: `Atualização de estoque - ${quantityChange > 0 ? 'entrada' : 'saída'} de ${Math.abs(quantityChange)} doses`,
      };

      await this.stockHistoryRepository.save(historyDto);
    }

    return updatedStock;
  }

  async remove(id: number, userId?: string): Promise<void> {
    const stock = await this.stockRepository.findOne({ where: { id } });
    if (!stock) {
      throw new Error('Estoque não encontrado');
    }

    // Registrar saída no histórico
    const historyDto: CreateStockHistoryDto = {
      post_id: stock.post_id,
      vaccine_id: stock.vaccine_id,
      user_id: userId,
      movement_type: StockMovementType.EXIT,
      quantity_change: stock.quantity,
      quantity_before: stock.quantity,
      quantity_after: 0,
      batch: stock.batch,
      expiration_date: stock.expiration_date.toString(),
      reason: 'Remoção de estoque',
      notes: 'Item de estoque removido completamente',
    };

    await this.stockHistoryRepository.save(historyDto);
    await this.stockRepository.delete(id);
  }

  async findAll(): Promise<Stock[]> {
    return this.stockRepository.find({
      relations: ['post', 'vaccine'],
      order: { id: 'DESC' }
    });
  }

  async findByPost(postId: number): Promise<Stock[]> {
    return this.stockRepository.find({
      where: { post_id: postId },
      relations: ['vaccine'],
      order: { id: 'DESC' }
    });
  }

  async findOne(id: number): Promise<Stock> {
    return this.stockRepository.findOne({ 
      where: { id },
      relations: ['post', 'vaccine']
    });
  }

  async recordVaccinationApplication(postId: number, vaccineId: number, userId?: string): Promise<void> {
    const stock = await this.stockRepository.findOne({
      where: { post_id: postId, vaccine_id: vaccineId },
      order: { expiration_date: 'ASC' } // Primeiro a vencer
    });

    if (!stock || stock.quantity <= 0) {
      throw new Error('Estoque insuficiente para aplicação');
    }

    const quantityBefore = stock.quantity;
    const quantityAfter = quantityBefore - 1;

    // Atualizar estoque
    await this.stockRepository.update(stock.id, { quantity: quantityAfter });

    // Registrar saída no histórico
    const historyDto: CreateStockHistoryDto = {
      post_id: postId,
      vaccine_id: vaccineId,
      user_id: userId,
      movement_type: StockMovementType.EXIT,
      quantity_change: 1,
      quantity_before: quantityBefore,
      quantity_after: quantityAfter,
      batch: stock.batch,
      expiration_date: stock.expiration_date.toString(),
      reason: 'Aplicação de vacina',
      notes: 'Dose aplicada em paciente',
    };

    await this.stockHistoryRepository.save(historyDto);
  }

  async recordExpiredStock(stockId: number, userId?: string): Promise<void> {
    const stock = await this.stockRepository.findOne({ where: { id: stockId } });
    if (!stock) {
      throw new Error('Estoque não encontrado');
    }

    const quantityBefore = stock.quantity;
    
    // Registrar vencimento no histórico
    const historyDto: CreateStockHistoryDto = {
      post_id: stock.post_id,
      vaccine_id: stock.vaccine_id,
      user_id: userId,
      movement_type: StockMovementType.EXPIRED,
      quantity_change: quantityBefore,
      quantity_before: quantityBefore,
      quantity_after: 0,
      batch: stock.batch,
      expiration_date: stock.expiration_date.toString(),
      reason: 'Vacina vencida',
      notes: 'Remoção de vacinas vencidas do estoque',
    };

    await this.stockHistoryRepository.save(historyDto);
    
    // Remover estoque vencido
    await this.stockRepository.delete(stockId);
  }
}
