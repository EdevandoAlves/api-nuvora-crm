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
import { Customer } from "./Customer";
import { Contact } from "./Contact";
import { User } from "./User";

export enum InteractionType {
  EMAIL = "EMAIL",
  CALL = "CALL",
  MEETING = "MEETING",
  NOTE = "NOTE",
  TASK = "TASK",
  WHATSAPP = "WHATSAPP",
}

@Entity()
export class Interaction {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "uuid" })
  organizationId: string;

  @ManyToOne(() => Organization, (organization) => organization.interactions)
  @JoinColumn({ name: "organizationId" })
  organization: Organization;

  @Column({ type: "uuid" })
  customerId: string;

  @ManyToOne(() => Customer, (customer) => customer.interactions)
  @JoinColumn({ name: "customerId" })
  customer: Customer;

  @Column({ type: "uuid", nullable: true })
  contactId: string;

  @ManyToOne(() => Contact, (contact) => contact.interactions, {
    nullable: true,
  })
  @JoinColumn({ name: "contactId" })
  contact: Contact;

  @Column({ type: "uuid" })
  userId: string;

  @ManyToOne(() => User, (user) => user.interactions)
  @JoinColumn({ name: "userId" })
  user: User;

  @Column({
    type: "enum",
    enum: InteractionType,
  })
  type: InteractionType;

  @Column({ type: "varchar", length: 255, nullable: true })
  subject: string;

  @Column({ type: "text" })
  description: string;

  @Column({ type: "int", nullable: true })
  duration: number; // in minutes

  @Column({ type: "timestamp", nullable: true })
  scheduledAt: Date;

  @Column({ type: "timestamp", nullable: true })
  completedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
