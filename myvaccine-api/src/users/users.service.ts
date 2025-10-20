import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { UpdateUserDto } from './dto/user.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findByCpf(cpf: string): Promise<Omit<User, 'password'>> {
    const user = await this.userRepository.findOne({ where: { cpf } });
    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }
    const { password, ...safeUser } = user as any;
    return safeUser;
  }

  async updateByCpf(cpf: string, data: UpdateUserDto): Promise<Omit<User, 'password'>> {
    const user = await this.userRepository.findOne({ where: { cpf } });
    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    if (data.email && data.email !== user.email) {
      const existing = await this.userRepository.findOne({ where: { email: data.email } });
      if (existing && existing.cpf !== cpf) {
        throw new ConflictException('Email já está em uso');
      }
    }

    if (data.password) {
      user.password = await bcrypt.hash(data.password, 10);
    }

    if (data.name !== undefined) user.name = data.name;
    if (data.email !== undefined) user.email = data.email;
    if (data.dob !== undefined) user.dob = new Date(data.dob);
    if (data.address !== undefined) user.address = data.address;
    if (data.telephone !== undefined) user.telephone = data.telephone;

    const saved = await this.userRepository.save(user);
    const { password, ...safeUser } = saved as any;
    return safeUser;
  }
}


