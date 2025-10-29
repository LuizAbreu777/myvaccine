import {
  Entity,
  PrimaryColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from "typeorm";
import { User } from "./user.entity";

@Entity("dependents")
export class Dependent {
  @PrimaryColumn({ length: 14 })
  cpf: string;

  @Column({ length: 100 })
  name: string;

  @Column({ type: "date" })
  dob: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relacionamentos
  @ManyToOne(() => User)
  @JoinColumn({ name: "user_cpf" })
  user: User;
}
