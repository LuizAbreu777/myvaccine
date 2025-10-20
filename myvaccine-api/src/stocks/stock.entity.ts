import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Post } from '../posts/post.entity';
import { Vaccine } from '../vaccines/vaccine.entity';

@Entity('stocks')
export class Stock {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  post_id: number;

  @Column()
  vaccine_id: number;

  @Column()
  quantity: number;

  @Column({ length: 50 })
  batch: string;

  @Column({ type: 'date' })
  expiration_date: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => Post, post => post.stocks)
  @JoinColumn({ name: 'post_id' })
  post: Post;

  @ManyToOne(() => Vaccine, vaccine => vaccine.stocks)
  @JoinColumn({ name: 'vaccine_id' })
  vaccine: Vaccine;
}
