import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Dependent } from '../users/dependent.entity';
import { User } from '../users/user.entity';

@Injectable()
export class DependentsSeedService {
  constructor(
    @InjectRepository(Dependent)
    private dependentRepository: Repository<Dependent>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async seedDependents() {
    console.log('🌱 Iniciando seed de dependentes...');

    // Buscar usuário Luiz Fernando
    const luizFernando = await this.userRepository.findOne({
      where: { email: 'luiz.fernando@myvaccine.com' },
    });

    if (!luizFernando) {
      console.log('❌ Usuário Luiz Fernando não encontrado');
      return;
    }

    console.log(`✅ Usuário Luiz Fernando encontrado: ${luizFernando.cpf}`);

    // Criar dependentes
    const dependents = [
      {
        cpf: '123.456.789-01',
        name: 'Pedro Luiz Fernando',
        dob: '2015-06-15',
        relationship: 'Filho',
        user_cpf: luizFernando.cpf,
      },
      {
        cpf: '987.654.321-00',
        name: 'José Fernando Silva',
        dob: '1955-11-20',
        relationship: 'Pai',
        user_cpf: luizFernando.cpf,
      },
    ];

    for (const dependentData of dependents) {
      const dependentExists = await this.dependentRepository.findOne({
        where: { cpf: dependentData.cpf },
      });

      if (!dependentExists) {
        const dependent = this.dependentRepository.create({
          ...dependentData,
          dob: new Date(dependentData.dob),
        });
        await this.dependentRepository.save(dependent);
        console.log(`✅ Dependente ${dependentData.name} (${dependentData.relationship}) criado`);
      } else {
        console.log(`⚠️  Dependente ${dependentData.name} já existe`);
      }
    }

    console.log('🎉 Seed de dependentes concluído!');
  }
}

