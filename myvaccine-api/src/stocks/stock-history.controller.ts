import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { StockHistoryService } from './stock-history.service';
import { CreateStockHistoryDto, StockHistoryResponseDto } from './dto/stock-history.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../users/user.entity';
import { StockMovementType } from './stock-history.entity';

@Controller('stock-history')
@UseGuards(JwtAuthGuard, RolesGuard)
export class StockHistoryController {
  constructor(private readonly stockHistoryService: StockHistoryService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  async create(@Body() createStockHistoryDto: CreateStockHistoryDto) {
    return await this.stockHistoryService.create(createStockHistoryDto);
  }

  @Get()
  @Roles(UserRole.ADMIN)
  async findAll() {
    return await this.stockHistoryService.findAll();
  }

  @Get('recent')
  @Roles(UserRole.ADMIN)
  async getRecentMovements(@Query('limit') limit?: string) {
    const limitNumber = limit ? parseInt(limit) : 50;
    return await this.stockHistoryService.getRecentMovements(limitNumber);
  }

  @Get('stats')
  @Roles(UserRole.ADMIN)
  async getSummaryStats() {
    return await this.stockHistoryService.getSummaryStats();
  }

  @Get('post/:postId')
  @Roles(UserRole.ADMIN)
  async findByPost(@Param('postId') postId: string) {
    return await this.stockHistoryService.findByPost(parseInt(postId));
  }

  @Get('vaccine/:vaccineId')
  @Roles(UserRole.ADMIN)
  async findByVaccine(@Param('vaccineId') vaccineId: string) {
    return await this.stockHistoryService.findByVaccine(parseInt(vaccineId));
  }

  @Get('movement/:movementType')
  @Roles(UserRole.ADMIN)
  async findByMovementType(@Param('movementType') movementType: StockMovementType) {
    return await this.stockHistoryService.findByMovementType(movementType);
  }

  @Get('date-range')
  @Roles(UserRole.ADMIN)
  async getMovementsByDateRange(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return await this.stockHistoryService.getMovementsByDateRange(
      new Date(startDate),
      new Date(endDate),
    );
  }
}
