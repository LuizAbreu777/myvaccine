import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StockHistory, StockMovementType } from '../stocks/stock-history.entity';
import { Stock } from '../stocks/stock.entity';
import { User } from '../users/user.entity';

@Injectable()
export class StockHistorySeedService {
  constructor(
    @InjectRepository(StockHistory)
    private stockHistoryRepository: Repository<StockHistory>,
    @InjectRepository(Stock)
    private stockRepository: Repository<Stock>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async seedStockHistory() {
    console.log('🌱 Iniciando seed do histórico de estoque...');

    // Buscar usuário admin
    const adminUser = await this.userRepository.findOne({
      where: { email: 'admin@myvaccine.com' }
    });

    if (!adminUser) {
      console.log('❌ Usuário admin não encontrado');
      return;
    }

    // Buscar todos os estoques existentes
    const stocks = await this.stockRepository.find({
      relations: ['post', 'vaccine']
    });

    if (stocks.length === 0) {
      console.log('❌ Nenhum estoque encontrado');
      return;
    }

    console.log(`📦 Encontrados ${stocks.length} itens de estoque`);

    // Criar histórico para cada estoque existente
    for (const stock of stocks) {
      // Registrar entrada inicial (criação do estoque)
      const initialEntry = new StockHistory();
      initialEntry.post_id = stock.post_id;
      initialEntry.vaccine_id = stock.vaccine_id;
      initialEntry.user_id = adminUser.cpf;
      initialEntry.movement_type = StockMovementType.ENTRY;
      initialEntry.quantity_change = stock.quantity;
      initialEntry.quantity_before = 0;
      initialEntry.quantity_after = stock.quantity;
      initialEntry.batch = stock.batch;
      initialEntry.expiration_date = stock.expiration_date.toString();
      initialEntry.reason = 'Estoque inicial criado pelo sistema';
      initialEntry.notes = `Entrada inicial de ${stock.quantity} doses da vacina ${stock.vaccine?.name} no posto ${stock.post?.name}`;

      await this.stockHistoryRepository.save(initialEntry);

      // Simular algumas movimentações adicionais para alguns estoques
      if (Math.random() > 0.5) { // 50% chance de ter movimentações adicionais
        await this.createAdditionalMovements(stock, adminUser.cpf);
      }
    }

    console.log('✅ Histórico de estoque criado com sucesso!');
  }

  private async createAdditionalMovements(stock: Stock, userId: string) {
    const movements = [];

    // Simular algumas saídas (aplicações de vacinas)
    const exitCount = Math.floor(Math.random() * 3) + 1; // 1-3 saídas
    let currentQuantity = stock.quantity;

    for (let i = 0; i < exitCount; i++) {
      const exitQuantity = Math.floor(Math.random() * 5) + 1; // 1-5 doses por saída
      if (currentQuantity >= exitQuantity) {
        currentQuantity -= exitQuantity;

        const exit = new StockHistory();
        exit.post_id = stock.post_id;
        exit.vaccine_id = stock.vaccine_id;
        exit.user_id = userId;
        exit.movement_type = StockMovementType.EXIT;
        exit.quantity_change = exitQuantity;
        exit.quantity_before = currentQuantity + exitQuantity;
        exit.quantity_after = currentQuantity;
        exit.batch = stock.batch;
        exit.expiration_date = stock.expiration_date.toString();
        exit.reason = 'Aplicação de vacinas';
        exit.notes = `Saída de ${exitQuantity} doses para aplicação em pacientes`;

        movements.push(exit);
      }
    }

    // Simular uma entrada adicional (reposição de estoque)
    if (Math.random() > 0.7) { // 30% chance de reposição
      const replenishQuantity = Math.floor(Math.random() * 20) + 10; // 10-30 doses
      currentQuantity += replenishQuantity;

      const replenish = new StockHistory();
      replenish.post_id = stock.post_id;
      replenish.vaccine_id = stock.vaccine_id;
      replenish.user_id = userId;
      replenish.movement_type = StockMovementType.ENTRY;
      replenish.quantity_change = replenishQuantity;
      replenish.quantity_before = currentQuantity - replenishQuantity;
      replenish.quantity_after = currentQuantity;
      replenish.batch = `LOTE-REP-${Math.floor(Math.random() * 1000)}`;
      replenish.expiration_date = stock.expiration_date.toString();
      replenish.reason = 'Reposição de estoque';
      replenish.notes = `Entrada de ${replenishQuantity} doses para reposição do estoque`;

      movements.push(replenish);
    }

    // Simular um ajuste de inventário
    if (Math.random() > 0.8) { // 20% chance de ajuste
      const adjustment = Math.floor(Math.random() * 3) - 1; // -1, 0, ou 1
      if (adjustment !== 0 && currentQuantity + adjustment >= 0) {
        const adjustmentQuantity = Math.abs(adjustment);
        const newQuantity = currentQuantity + adjustment;

        const adjust = new StockHistory();
        adjust.post_id = stock.post_id;
        adjust.vaccine_id = stock.vaccine_id;
        adjust.user_id = userId;
        adjust.movement_type = StockMovementType.ADJUSTMENT;
        adjust.quantity_change = adjustmentQuantity;
        adjust.quantity_before = currentQuantity;
        adjust.quantity_after = newQuantity;
        adjust.batch = stock.batch;
        adjust.expiration_date = stock.expiration_date.toString();
        adjust.reason = adjustment > 0 ? 'Ajuste positivo de inventário' : 'Ajuste negativo de inventário';
        adjust.notes = `Ajuste de inventário: ${adjustment > 0 ? '+' : '-'}${adjustmentQuantity} doses`;

        movements.push(adjust);
        currentQuantity = newQuantity;
      }
    }

    // Salvar todas as movimentações
    for (const movement of movements) {
      await this.stockHistoryRepository.save(movement);
    }

    // Atualizar a quantidade atual do estoque
    if (movements.length > 0) {
      await this.stockRepository.update(stock.id, {
        quantity: currentQuantity
      });
    }
  }
}