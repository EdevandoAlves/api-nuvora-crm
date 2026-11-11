import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Deal } from "src/entity/Deal";
import { DealProduct } from "src/entity/DealProduct";
import { Product } from "src/entity/Product";
import { DealProductsController } from "./deal-products.controller";
import { DealProductsService } from "./deal-products.service";

@Module({
  imports: [TypeOrmModule.forFeature([DealProduct, Deal, Product])],
  controllers: [DealProductsController],
  providers: [DealProductsService],
})
export class DealProductsModule {}
