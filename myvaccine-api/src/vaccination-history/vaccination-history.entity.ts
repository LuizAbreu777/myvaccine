import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../users/user.entity';
import { Vaccine } from '../vaccines/vaccine.entity';
import { Post } from '../posts/post.entity';

@Entity('vaccination_histories')
export class VaccinationHistory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 14 })
  user_cpf: string;

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

  @ManyToOne(() => User, user => user.vaccinationHistory)
  @JoinColumn({ name: 'user_cpf' })
  user: User;

  @ManyToOne(() => Vaccine, vaccine => vaccine.vaccinationHistory)
  @JoinColumn({ name: 'vaccine_id' })
  vaccine: Vaccine;

  @ManyToOne(() => Post, post => post.vaccinationHistory)
  @JoinColumn({ name: 'post_id' })
  post: Post;
}
