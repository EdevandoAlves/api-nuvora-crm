import { Module } from "@nestjs/common";
import { DealsService } from "./deals.service";
import { DealsController } from "./deals.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Customer } from "src/entity/Customer";
import { Deal } from "src/entity/Deal";

@Module({
  imports: [TypeOrmModule.forFeature([Customer, Deal])],
  controllers: [DealsController],
  providers: [DealsService],
})
export class DealsModule {}
