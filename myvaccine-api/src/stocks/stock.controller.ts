import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { StockService } from './stock.service';
import { CreateStockDto, UpdateStockDto } from './dto/stock.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { UserRole } from '../users/user.entity';

@Controller('stocks')
@UseGuards(JwtAuthGuard, RolesGuard)
export class StockController {
  constructor(private readonly stockService: StockService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  async create(@Body() createStockDto: CreateStockDto, @Request() req) {
    const userId = req.user?.cpf;
    return await this.stockService.create(createStockDto, userId);
  }

  @Get()
  @Roles(UserRole.ADMIN)
  async findAll() {
    return await this.stockService.findAll();
  }

  @Get('post/:postId')
  async findByPost(@Param('postId') postId: string) {
    return await this.stockService.findByPost(parseInt(postId));
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.stockService.findOne(parseInt(id));
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  async update(@Param('id') id: string, @Body() updateStockDto: UpdateStockDto, @Request() req) {
    const userId = req.user?.cpf;
    return await this.stockService.update(parseInt(id), updateStockDto, userId);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  async remove(@Param('id') id: string, @Request() req) {
    const userId = req.user?.cpf;
    await this.stockService.remove(parseInt(id), userId);
    return { message: 'Estoque removido com sucesso' };
  }

  @Post(':id/expired')
  @Roles(UserRole.ADMIN)
  async markAsExpired(@Param('id') id: string, @Request() req) {
    const userId = req.user?.cpf;
    await this.stockService.recordExpiredStock(parseInt(id), userId);
    return { message: 'Estoque vencido removido com sucesso' };
  }
}
