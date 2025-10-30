import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { Deal } from "./Deal";
import { Product } from "./Product";

@Entity()
export class DealProduct {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "uuid" })
  dealId: string;

  @ManyToOne(() => Deal, (deal) => deal.dealProducts)
  @JoinColumn({ name: "dealId" })
  deal: Deal;

  @Column({ type: "uuid" })
  productId: string;

  @ManyToOne(() => Product, (product) => product.dealProducts)
  @JoinColumn({ name: "productId" })
  product: Product;

  @Column({ type: "int" })
  quantity: number;

  @Column({ type: "decimal", precision: 15, scale: 2 })
  unitPrice: number;

  @Column({ type: "decimal", precision: 5, scale: 2, default: 0 })
  discount: number;

  @Column({ type: "decimal", precision: 15, scale: 2 })
  totalPrice: number;
}
