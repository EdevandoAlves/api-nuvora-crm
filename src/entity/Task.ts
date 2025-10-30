import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { Organization } from "./Organization";
import { User } from "./User";
import { Customer } from "./Customer";
import { Deal } from "./Deal";

export enum TaskType {
  CALL = "CALL",
  EMAIL = "EMAIL",
  FOLLOW_UP = "FOLLOW_UP",
  DEMO = "DEMO",
  PROPOSAL = "PROPOSAL",
  MEETING = "MEETING",
}

export enum TaskPriority {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
}

export enum TaskStatus {
  PENDING = "PENDING",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}

@Entity()
export class Task {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "uuid" })
  organizationId: string;

  @ManyToOne(() => Organization, (organization) => organization.tasks)
  @JoinColumn({ name: "organizationId" })
  organization: Organization;

  @Column({ type: "uuid" })
  userId: string;

  @ManyToOne(() => User, (user) => user.tasks)
  @JoinColumn({ name: "userId" })
  assignee: User;

  @Column({ type: "uuid" })
  customerId: string;

  @ManyToOne(() => Customer, (customer) => customer.tasks, { nullable: true })
  @JoinColumn({ name: "customerId" })
  customer: Customer;

  @Column({ type: "uuid", nullable: true })
  dealId: string;

  @ManyToOne(() => Deal, (deal) => deal.tasks, { nullable: true })
  @JoinColumn({ name: "dealId" })
  deal: Deal;

  @Column({ type: "varchar", length: 255 })
  title: string;

  @Column({ type: "text", nullable: true })
  description: string;

  @Column({ type: "enum", enum: TaskType })
  type: TaskType;

  @Column({ type: "enum", enum: TaskPriority, default: TaskPriority.MEDIUM })
  priority: TaskPriority;

  @Column({ type: "date" })
  dueDate: Date;

  @Column({ type: "enum", enum: TaskStatus, default: TaskStatus.PENDING })
  status: TaskStatus;

  @Column({ type: "timestamp", nullable: true })
  completedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
