import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Stock } from '../stocks/stock.entity';
import { VaccinationHistory } from '../vaccination-history/vaccination-history.entity';

export enum PostStatus {
  ACTIVE = 'ativo',
  INACTIVE = 'inativo'
}

@Entity('posts')
export class Post {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string;

  @Column({ length: 100 })
  address: string;

  @Column({ length: 50 })
  city: string;

  @Column({ length: 2 })
  state: string;

  @Column({
    type: 'varchar',
    length: 20,
    default: PostStatus.ACTIVE
  })
  status: PostStatus;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToMany(() => Stock, stock => stock.post)
  stocks: Stock[];

  @OneToMany(() => VaccinationHistory, vaccinationHistory => vaccinationHistory.post)
  vaccinationHistory: VaccinationHistory[];
}
