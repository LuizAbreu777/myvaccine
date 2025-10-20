import { Controller, Get, Put, Body, UseGuards, Request } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UpdateUserDto } from './dto/user.dto';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  async getMe(@Request() req) {
    const cpf = req.user?.cpf;
    return this.usersService.findByCpf(cpf);
  }

  @Put('me')
  async updateMe(@Request() req, @Body() body: UpdateUserDto) {
    const cpf = req.user?.cpf;
    return this.usersService.updateByCpf(cpf, body);
  }
}


