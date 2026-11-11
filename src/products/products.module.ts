import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { DealProduct } from "src/entity/DealProduct";
import { Product } from "src/entity/Product";
import { ProductsController } from "./products.controller";
import { ProductsService } from "./products.service";

@Module({
  imports: [TypeOrmModule.forFeature([Product, DealProduct])],
  controllers: [ProductsController],
  providers: [ProductsService],
})
export class ProductsModule {}
