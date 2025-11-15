import { Injectable, UnauthorizedException, ConflictException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import * as bcrypt from "bcryptjs";
import { User, UserRole } from "../users/user.entity";
import { LoginDto, CreateUserDto } from "../users/dto/user.dto";

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.userRepository.findOne({ where: { email } });
    if (user && (await bcrypt.compare(password, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    if (!user) {
      throw new UnauthorizedException("Credenciais inválidas");
    }

    const payload = { email: user.email, sub: user.cpf, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        cpf: user.cpf,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }

  async register(createUserDto: CreateUserDto) {
    console.log('Dados recebidos:', createUserDto);
    
    try {
      // Verificar se o usuário já existe por email
      const existingUser = await this.userRepository.findOne({ 
        where: { email: createUserDto.email } 
      });
      
      if (existingUser) {
        throw new ConflictException('Email já está em uso');
      }

      // Verificar se o CPF já existe
      const existingCpf = await this.userRepository.findOne({ 
        where: { cpf: createUserDto.cpf } 
      });
      
      if (existingCpf) {
        throw new ConflictException('CPF já está em uso');
      }

      // Hash da senha
      const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
      
      // Criar usuário
      const user = this.userRepository.create({
        cpf: createUserDto.cpf,
        name: createUserDto.name,
        email: createUserDto.email,
        password: hashedPassword,
        dob: createUserDto.dob,
        address: createUserDto.address,
        telephone: createUserDto.telephone,
        role: createUserDto.role || UserRole.USER
      });

      console.log('Usuário criado:', user);
      const savedUser = await this.userRepository.save(user);
      console.log('Usuário salvo:', savedUser);
      
      // Retornar dados do usuário sem a senha
      const { password, ...userResponse } = savedUser;
      return userResponse;
    } catch (error) {
      console.error('Erro no register:', error);
      
      // Tratar erros de constraint do banco
      if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        throw new ConflictException('Email ou CPF já está em uso');
      }
      
      // Se for um ConflictException, re-throw
      if (error instanceof ConflictException) {
        throw error;
      }
      
      // Para outros erros, lançar erro genérico
      throw new Error('Erro interno do servidor');
    }
  }

  async getProfile(cpf: string) {
    const user = await this.userRepository.findOne({ where: { cpf } });
    if (!user) {
      throw new UnauthorizedException("Usuário não encontrado");
    }
    // Retornar dados do usuário sem a senha
    const { password, ...userResponse } = user;
    return userResponse;
  }
}
