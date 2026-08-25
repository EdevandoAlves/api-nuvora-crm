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
import { DealProduct } from "./DealProduct";

@Entity()
export class Product {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "uuid" })
  organizationId: string;

  @ManyToOne(() => Organization, (organization) => organization.products)
  @JoinColumn({ name: "organizationId" })
  organization: Organization;

  @Column({ type: "varchar", length: 255 })
  name: string;

  @Column({ type: "text", nullable: true })
  description: string;

  @Column({ type: "decimal", precision: 15, scale: 2 })
  price: number;

  @Column({ type: "varchar", length: 100, nullable: true })
  category: string;

  @Column({ type: "boolean", default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => DealProduct, (dealProduct) => dealProduct.product)
  dealProducts: DealProduct[];
}
