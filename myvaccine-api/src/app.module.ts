import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { config } from './config/config';

// Entities
import { User } from './users/user.entity';
import { Vaccine } from './vaccines/vaccine.entity';
import { Post } from './posts/post.entity';
import { Stock } from './stocks/stock.entity';
import { StockHistory } from './stocks/stock-history.entity';
import { VaccinationHistory } from './vaccination-history/vaccination-history.entity';

// Modules
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { VaccinesModule } from './vaccines/vaccines.module';
import { PostsModule } from './posts/posts.module';
import { StocksModule } from './stocks/stocks.module';
import { StockHistoryModule } from './stocks/stock-history.module';
import { VaccinationHistoryModule } from './vaccination-history/vaccination-history.module';
import { SeedModule } from './seed/seed.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: config.databasePath,
      entities: [User, Vaccine, Post, Stock, StockHistory, VaccinationHistory],
      synchronize: config.nodeEnv === 'development', // Apenas para desenvolvimento
      logging: config.nodeEnv === 'development', // Para debug
      autoLoadEntities: true,
    }),
    JwtModule.register({
      secret: config.jwtSecret,
      signOptions: { expiresIn: '24h' },
    }),
    PassportModule,
    AuthModule,
    UsersModule,
    VaccinesModule,
    PostsModule,
    StocksModule,
    StockHistoryModule,
    VaccinationHistoryModule,
    SeedModule,
  ],
  providers: [],
})
export class AppModule {}
