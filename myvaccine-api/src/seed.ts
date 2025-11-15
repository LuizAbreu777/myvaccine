import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SeedModule } from './seed/seed.module';
import { SeedService } from './seed/seed.service';
import { StockHistorySeedService } from './seed/stock-history-seed.service';
import { DependentsSeedService } from './seed/dependents-seed.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  
  const seedModule = app.select(SeedModule);
  const seedService = seedModule.get(SeedService);
  const stockHistorySeedService = seedModule.get(StockHistorySeedService);
  const dependentsSeedService = seedModule.get(DependentsSeedService);
  
  await seedService.seed();
  await stockHistorySeedService.seedStockHistory();
  await dependentsSeedService.seedDependents();
  
  console.log('Database seeded successfully!');
  await app.close();
}

bootstrap().catch(console.error);
