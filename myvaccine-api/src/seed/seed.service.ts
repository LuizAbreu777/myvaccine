import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from '../users/user.entity';
import { Vaccine } from '../vaccines/vaccine.entity';
import { Post, PostStatus } from '../posts/post.entity';
import { Stock } from '../stocks/stock.entity';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class SeedService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Vaccine)
    private vaccineRepository: Repository<Vaccine>,
    @InjectRepository(Post)
    private postRepository: Repository<Post>,
    @InjectRepository(Stock)
    private stockRepository: Repository<Stock>,
  ) {}

  async seed() {
    console.log('🌱 Iniciando seed do banco de dados...');

    // Criar usuário admin
    const adminExists = await this.userRepository.findOne({ where: { email: 'admin@myvaccine.com' } });
    if (!adminExists) {
      const adminPassword = await bcrypt.hash('admin123', 10);
      const admin = this.userRepository.create({
        cpf: '12345678901',
        name: 'Administrador',
        email: 'admin@myvaccine.com',
        password: adminPassword,
        role: UserRole.ADMIN,
        dob: '1990-01-01',
        address: 'Rua Admin, 123',
        telephone: '11999999999',
      });
      await this.userRepository.save(admin);
      console.log('✅ Usuário admin criado');
    }

    // Criar usuários comuns
    const users = [
      {
        cpf: '98765432100',
        name: 'Usuário Teste',
        email: 'user@myvaccine.com',
        password: 'user123',
        dob: '1995-05-15',
        address: 'Rua Usuário, 456',
        telephone: '11888888888',
      },
      {
        cpf: '11122233344',
        name: 'Luiz Fernando',
        email: 'luiz.fernando@myvaccine.com',
        password: 'luiz123',
        dob: '1988-03-20',
        address: 'Rua das Flores, 789',
        telephone: '11977777777',
      },
      {
        cpf: '55566677788',
        name: 'Hatus Luiz',
        email: 'hatus.luiz@myvaccine.com',
        password: 'hatus123',
        dob: '1992-07-10',
        address: 'Av. Principal, 321',
        telephone: '11966666666',
      },
      {
        cpf: '99988877766',
        name: 'Liliane Alves',
        email: 'liliane.alves@myvaccine.com',
        password: 'liliane123',
        dob: '1990-11-25',
        address: 'Rua da Paz, 654',
        telephone: '11955555555',
      },
    ];

    for (const userData of users) {
      const userExists = await this.userRepository.findOne({ where: { email: userData.email } });
      if (!userExists) {
        const userPassword = await bcrypt.hash(userData.password, 10);
        const user = this.userRepository.create({
          cpf: userData.cpf,
          name: userData.name,
          email: userData.email,
          password: userPassword,
          role: UserRole.USER,
          dob: userData.dob,
          address: userData.address,
          telephone: userData.telephone,
        });
        await this.userRepository.save(user);
        console.log(`✅ Usuário ${userData.name} criado`);
      }
    }

    // Criar vacinas
    const vaccines = [
      {
        name: 'Vacina contra COVID-19',
        min_age: 12,
        max_age: null,
        contraindications: 'Alergia a componentes da vacina',
      },
      {
        name: 'Vacina contra Gripe',
        min_age: 6,
        max_age: null,
        contraindications: 'Alergia ao ovo',
      },
      {
        name: 'Vacina contra Hepatite B',
        min_age: 0,
        max_age: null,
        contraindications: 'Alergia à levedura',
      },
      {
        name: 'Vacina contra Sarampo',
        min_age: 12,
        max_age: null,
        contraindications: 'Gravidez, imunossupressão',
      },
    ];

    for (const vaccineData of vaccines) {
      const vaccineExists = await this.vaccineRepository.findOne({ where: { name: vaccineData.name } });
      if (!vaccineExists) {
        const vaccine = this.vaccineRepository.create(vaccineData);
        await this.vaccineRepository.save(vaccine);
        console.log(`✅ Vacina ${vaccineData.name} criada`);
      }
    }

    // Criar postos
    const posts = [
      {
        name: 'Posto de Saúde Centro I',
        address: '112, Praça Poli, 42 - Centro',
        city: 'Abreu e Lima',
        state: 'PE',
        status: PostStatus.ACTIVE,
      },
      {
        name: 'Posto de Saúde Centro II',
        address: 'Centro, 53520-250',
        city: 'Abreu e Lima',
        state: 'PE',
        status: PostStatus.ACTIVE,
      },
      {
        name: 'PSF Alto São Miguel ',
        address: '69, R. Murici, 1 - Alto São Miguel',
        city: 'Abreu e Lima',
        state: 'PE',
        status: PostStatus.ACTIVE,
      },
    ];

    const savedPosts = [];
    for (const postData of posts) {
      const postExists = await this.postRepository.findOne({ where: { name: postData.name } });
      if (!postExists) {
        const post = this.postRepository.create(postData);
        const savedPost = await this.postRepository.save(post);
        savedPosts.push(savedPost);
        console.log(`✅ Posto ${postData.name} criado`);
      } else {
        savedPosts.push(postExists);
      }
    }

    // Criar estoque
    const vaccinesList = await this.vaccineRepository.find();
    for (const post of savedPosts) {
      for (const vaccine of vaccinesList) {
        const stockExists = await this.stockRepository.findOne({
          where: { post_id: post.id, vaccine_id: vaccine.id }
        });
        if (!stockExists) {
          const stock = this.stockRepository.create({
            post_id: post.id,
            vaccine_id: vaccine.id,
            quantity: Math.floor(Math.random() * 50) + 10, // 10-60 doses
            batch: `LOTE${Math.floor(Math.random() * 1000)}`,
            expiration_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 ano
          });
          await this.stockRepository.save(stock);
          console.log(`✅ Estoque ${vaccine.name} no ${post.name} criado`);
        }
      }
    }

    console.log('🎉 Seed concluído com sucesso!');
    console.log('📋 Credenciais de teste:');
    console.log('   Admin: admin@myvaccine.com / admin123');
    console.log('   Usuários:');
    console.log('     - user@myvaccine.com / user123');
    console.log('     - luiz.fernando@myvaccine.com / luiz123');
    console.log('     - hatus.luiz@myvaccine.com / hatus123');
    console.log('     - liliane.alves@myvaccine.com / liliane123');
  }
}
