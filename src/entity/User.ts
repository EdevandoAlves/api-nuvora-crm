import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Unique,
} from "typeorm";
import { Organization } from "./Organization";
import { Customer } from "./Customer";
import { Interaction } from "./Interaction";
import { Deal } from "./Deal";
import { Task } from "./Task";

export enum UserRole {
  OWNER = "OWNER",
  ADMIN = "ADMIN",
  MANAGER = "MANAGER",
  SALES = "SALES",
  SUPPORT = "SUPPORT",
}

@Entity()
@Unique(["email"])
export class User {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "uuid" })
  organizationId: string;

  @ManyToOne(() => Organization, (organization) => organization.users)
  @JoinColumn({ name: "organizationId" })
  organization: Organization;

  @Column({ type: "varchar", length: 255 })
  email: string;

  @Column({ type: "varchar", length: 255 })
  password: string; // Hashed

  @Column({ type: "varchar", length: 100 })
  firstName: string;

  @Column({ type: "varchar", length: 100 })
  lastName: string;

  @Column({
    type: "enum",
    enum: UserRole,
    default: UserRole.SALES,
  })
  role: UserRole;

  @Column({ type: "varchar", length: 255, nullable: true })
  avatar: string;

  @Column({ type: "boolean", default: true })
  isActive: boolean;

  @Column({ type: "timestamp", nullable: true })
  lastLoginAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Customer, (customer) => customer.owner)
  customers: Customer[];

  @OneToMany(() => Interaction, (interaction) => interaction.user)
  interactions: Interaction[];

  @OneToMany(() => Deal, (deal) => deal.owner)
  deals: Deal[];

  @OneToMany(() => Task, (task) => task.assignee)
  tasks: Task[];
}