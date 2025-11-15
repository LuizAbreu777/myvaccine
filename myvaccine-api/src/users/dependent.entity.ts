import {
  Entity,
  PrimaryColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from "typeorm";
import { User } from "./user.entity";
import { VaccinationHistory } from "../vaccination-history/vaccination-history.entity";

@Entity("dependents")
export class Dependent {
  @PrimaryColumn({ length: 14 })
  cpf: string;

  @Column({ length: 100 })
  name: string;

  @Column({ type: "date" })
  dob: Date;

  @Column({ length: 50 })
  relationship: string;

  @Column({ length: 14 })
  user_cpf: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relacionamentos
  @ManyToOne(() => User)
  @JoinColumn({ name: "user_cpf" })
  user: User;

  @OneToMany(() => VaccinationHistory, (vaccinationHistory) => vaccinationHistory.dependent)
  vaccinationHistory: VaccinationHistory[];
}
