import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Stock } from '../stocks/stock.entity';
import { VaccinationHistory } from '../vaccination-history/vaccination-history.entity';

@Entity('vaccines')
export class Vaccine {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string;

  @Column()
  min_age: number;

  @Column({ nullable: true })
  max_age: number;

  @Column({ type: 'text', nullable: true })
  contraindications: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToMany(() => Stock, stock => stock.vaccine)
  stocks: Stock[];

  @OneToMany(() => VaccinationHistory, vaccinationHistory => vaccinationHistory.vaccine)
  vaccinationHistory: VaccinationHistory[];
}
