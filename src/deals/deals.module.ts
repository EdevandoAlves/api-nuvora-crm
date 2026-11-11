import { Module } from "@nestjs/common";
import { DealsService } from "./deals.service";
import { DealsController } from "./deals.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Customer } from "src/entity/Customer";
import { Deal } from "src/entity/Deal";
import { DealProduct } from "src/entity/DealProduct";

@Module({
  imports: [TypeOrmModule.forFeature([Customer, Deal, DealProduct])],
  controllers: [DealsController],
  providers: [DealsService],
})
export class DealsModule {}
