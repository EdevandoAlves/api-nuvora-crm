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
import { User } from "./User";
import { Customer } from "./Customer";
import { Deal } from "./Deal";
import { Product } from "./Product";
import { Interaction } from "./Interaction";
import { Task } from "./Task";
import { Contact } from "./Contact";

export enum PlanType {
  FREE = "FREE",
  BASIC = "BASIC",
  PRO = "PRO",
  ENTERPRISE = "ENTERPRISE",
}

@Entity()
@Unique(["slug"])
@Unique(["cnpj"])
export class Organization {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "varchar", length: 255 })
  name: string;

  @Column({ type: "varchar", length: 255 })
  slug: string;

  @Column({ type: "varchar", length: 14 })
  cnpj: string;

  @Column({ type: "enum", enum: PlanType, default: PlanType.FREE })
  plan: PlanType;

  @Column({ type: "int", default: 1 })
  maxUsers: number;

  @Column({ type: "boolean", default: true })
  isActive: boolean;

  @Column({ type: "timestamp", nullable: true })
  subscriptionEndsAt: Date;

  @Column({ type: "uuid", nullable: true })
  ownerId: string;

  @ManyToOne(() => User, { onDelete: "SET NULL" })
  @JoinColumn({ name: "ownerId" })
  owner: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => User, (user) => user.organization)
  users: User[];

  @OneToMany(() => Customer, (customer) => customer.organization)
  customers: Customer[];

  @OneToMany(() => Deal, (deal) => deal.organization)
  deals: Deal[];

  @OneToMany(() => Product, (product) => product.organization)
  products: Product[];

  @OneToMany(() => Interaction, (interaction) => interaction.organization)
  interactions: Interaction[];

  @OneToMany(() => Task, (task) => task.organization)
  tasks: Task[];

  @OneToMany(() => Contact, (contact) => contact.organization)
  contacts: Contact[];
}
