import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Post } from '../posts/post.entity';
import { Vaccine } from '../vaccines/vaccine.entity';
import { User } from '../users/user.entity';

export enum StockMovementType {
  ENTRY = 'entrada',
  EXIT = 'saida',
  ADJUSTMENT = 'ajuste',
  EXPIRED = 'vencido',
  TRANSFER = 'transferencia'
}

@Entity('stock_histories')
export class StockHistory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  post_id: number;

  @Column()
  vaccine_id: number;

  @Column({ nullable: true })
  user_id: string;

  @Column({
    type: 'varchar',
    length: 20,
  })
  movement_type: StockMovementType;

  @Column('int')
  quantity_change: number; // Positivo para entrada, negativo para saída

  @Column('int')
  quantity_before: number; // Quantidade antes da movimentação

  @Column('int')
  quantity_after: number; // Quantidade depois da movimentação

  @Column({ nullable: true })
  batch: string;

  @Column({ type: 'date', nullable: true })
  expiration_date: string;

  @Column({ nullable: true })
  reason: string; // Motivo da movimentação

  @Column({ nullable: true })
  notes: string; // Observações adicionais

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relacionamentos
  @ManyToOne(() => Post)
  @JoinColumn({ name: 'post_id' })
  post: Post;

  @ManyToOne(() => Vaccine)
  @JoinColumn({ name: 'vaccine_id' })
  vaccine: Vaccine;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
