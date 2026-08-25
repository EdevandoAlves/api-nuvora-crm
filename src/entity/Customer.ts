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
  DeleteDateColumn,
} from "typeorm";
import { Organization } from "./Organization";
import { User } from "./User";
import { Contact } from "./Contact";
import { Interaction } from "./Interaction";
import { Deal } from "./Deal";
import { Task } from "./Task";

export enum CustomerStatus {
  LEAD = "LEAD",
  PROSPECT = "PROSPECT",
  CUSTOMER = "CUSTOMER",
  CHURNED = "CHURNED",
}

@Entity()
@Unique(["organizationId", "cnpj"])
export class Customer {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "uuid" })
  organizationId: string;

  @ManyToOne(() => Organization, (organization) => organization.customers)
  @JoinColumn({ name: "organizationId" })
  organization: Organization;

  @Column({ type: "uuid" })
  ownerId: string;

  @ManyToOne(() => User, (user) => user.customers)
  @JoinColumn({ name: "ownerId" })
  owner: User;

  @Column({ type: "varchar", length: 255 })
  companyName: string;

  @Column({ type: "varchar", length: 14, nullable: true })
  cnpj: string;

  @Column({ type: "varchar", length: 100, nullable: true })
  industry: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  website: string;

  @Column({ type: "int", nullable: true })
  employeeCount: number;

  @Column({ type: "decimal", precision: 15, scale: 2, nullable: true })
  annualRevenue: number;

  @Column({ type: "jsonb", nullable: true })
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };

  @Column({
    type: "enum",
    enum: CustomerStatus,
    default: CustomerStatus.LEAD,
  })
  status: CustomerStatus;

  @Column({ type: "varchar", length: 100, nullable: true })
  source: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  @OneToMany(() => Contact, (contact) => contact.customer)
  contacts: Contact[];

  @OneToMany(() => Interaction, (interaction) => interaction.customer)
  interactions: Interaction[];

  @OneToMany(() => Deal, (deal) => deal.customer)
  deals: Deal[];

  @OneToMany(() => Task, (task) => task.customer)
  tasks: Task[];
}
