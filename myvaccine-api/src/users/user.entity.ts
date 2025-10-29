import {
  Entity,
  PrimaryColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { VaccinationHistory } from "../vaccination-history/vaccination-history.entity";
import { Dependent } from "./dependent.entity";

export enum UserRole {
  ADMIN = "admin",
  USER = "usuario",
}

@Entity("users")
export class User {
  @PrimaryColumn({ length: 14 })
  cpf: string;

  @Column({
    type: "varchar",
    length: 20,
    default: UserRole.USER,
  })
  role: UserRole;

  @Column({ length: 100 })
  name: string;

  @Column({ length: 255 })
  password: string;

  @Column({ length: 100, unique: true })
  email: string;

  @Column({ type: "date" })
  dob: Date;

  @Column({ length: 255 })
  address: string;

  @Column({ length: 15 })
  telephone: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToMany(
    () => VaccinationHistory,
    (vaccinationHistory) => vaccinationHistory.user
  )
  vaccinationHistory: VaccinationHistory[];

  @OneToMany(() => Dependent, (dependent) => dependent.user)
  dependents: Dependent[];
}
