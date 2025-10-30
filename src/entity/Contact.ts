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
import { Interaction } from "./Interaction";

@Entity()
export class Contact {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "uuid" })
  organizationId: string;

  @ManyToOne(() => Organization, (organization) => organization.contacts)
  @JoinColumn({ name: "organizationId" })
  organization: Organization;

  @Column({ type: "uuid" })
  customerId: string;

  @ManyToOne(() => Customer, (customer) => customer.contacts)
  @JoinColumn({ name: "customerId" })
  customer: Customer;

  @Column({ type: "varchar", length: 100 })
  firstName: string;

  @Column({ type: "varchar", length: 100 })
  lastName: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  email: string;

  @Column({ type: "varchar", length: 20, nullable: true })
  phone: string;

  @Column({ type: "varchar", length: 100, nullable: true })
  position: string;

  @Column({ type: "boolean", default: false })
  isPrimary: boolean;

  @Column({ type: "varchar", length: 255, nullable: true })
  linkedin: string;

  @Column({ type: "text", nullable: true })
  notes: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Interaction, (interaction) => interaction.contact)
  interactions: Interaction[];
}
