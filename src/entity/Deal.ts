import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from "typeorm";
import { Organization } from "./Organization";
import { Customer } from "./Customer";
import { User } from "./User";
import { DealProduct } from "./DealProduct";
import { Task } from "./Task";

export enum DealStage {
  QUALIFICATION = "QUALIFICATION",
  PROPOSAL = "PROPOSAL",
  NEGOTIATION = "NEGOTIATION",
  CLOSED_WON = "CLOSED_WON",
  CLOSED_LOST = "CLOSED_LOST",
}

@Entity()
export class Deal {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "uuid" })
  organizationId: string;

  @ManyToOne(() => Organization, (organization) => organization.deals)
  @JoinColumn({ name: "organizationId" })
  organization: Organization;

  @Column({ type: "uuid" })
  customerId: string;

  @ManyToOne(() => Customer, (customer) => customer.deals)
  @JoinColumn({ name: "customerId" })
  customer: Customer;

  @Column({ type: "uuid" })
  ownerId: string;

  @ManyToOne(() => User, (user) => user.deals)
  @JoinColumn({ name: "ownerId" })
  owner: User;

  @Column({ type: "varchar", length: 255 })
  title: string;

  @Column({ type: "decimal", precision: 15, scale: 2 })
  value: number;

  @Column({
    type: "enum",
    enum: DealStage,
    default: DealStage.QUALIFICATION,
  })
  stage: DealStage;

  @Column({ type: "int", default: 0 })
  probability: number; // 0-100

  @Column({ type: "date", nullable: true })
  expectedCloseDate: Date;

  @Column({ type: "varchar", length: 255, nullable: true })
  lostReason: string;

  @Column({ type: "timestamp", nullable: true })
  closedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => DealProduct, (dealProduct) => dealProduct.deal)
  dealProducts: DealProduct[];

  @OneToMany(() => Task, (task) => task.deal)
  tasks: Task[];
}
