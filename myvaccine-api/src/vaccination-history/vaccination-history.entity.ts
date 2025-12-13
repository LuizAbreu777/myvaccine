import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../users/user.entity';
import { Dependent } from '../users/dependent.entity';
import { Vaccine } from '../vaccines/vaccine.entity';
import { Post } from '../posts/post.entity';

@Entity('vaccination_histories')
export class VaccinationHistory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 14 })
  user_cpf: string;

  @Column({ default: false })
  is_dependent: boolean;

  @Column()
  vaccine_id: number;

  @Column()
  post_id: number;

  @Column({ length: 50 })
  batch: string;

  @Column({ type: 'datetime' })
  application_date: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relação com User - sem criar FK física para evitar conflito
  // Usamos createForeignKeyConstraints: false para não criar FK no banco
  @ManyToOne(() => User, user => user.vaccinationHistory, { 
    nullable: true,
    createForeignKeyConstraints: false 
  })
  @JoinColumn({ name: 'user_cpf' })
  user: User;

  // Relação com Dependent usando a mesma coluna user_cpf
  // Sem FK física - o relacionamento é lógico baseado em is_dependent
  @ManyToOne(() => Dependent, { 
    nullable: true,
    createForeignKeyConstraints: false 
  })
  @JoinColumn({ name: 'user_cpf', referencedColumnName: 'cpf' })
  dependent: Dependent;

  @ManyToOne(() => Vaccine, vaccine => vaccine.vaccinationHistory)
  @JoinColumn({ name: 'vaccine_id' })
  vaccine: Vaccine;

  @ManyToOne(() => Post, post => post.vaccinationHistory)
  @JoinColumn({ name: 'post_id' })
  post: Post;
}
