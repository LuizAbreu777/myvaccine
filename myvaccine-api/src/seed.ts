import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SeedModule } from './seed/seed.module';
import { SeedService } from './seed/seed.service';
import { StockHistorySeedService } from './seed/stock-history-seed.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  
  const seedModule = app.select(SeedModule);
  const seedService = seedModule.get(SeedService);
  const stockHistorySeedService = seedModule.get(StockHistorySeedService);
  
  await seedService.seed();
  await stockHistorySeedService.seedStockHistory();
  
  console.log('Database seeded successfully!');
  await app.close();
}

bootstrap().catch(console.error);
