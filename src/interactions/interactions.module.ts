import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Contact } from "src/entity/Contact";
import { Customer } from "src/entity/Customer";
import { Interaction } from "src/entity/Interaction";
import { InteractionsController } from "./interactions.controller";
import { InteractionsService } from "./interactions.service";

@Module({
  imports: [TypeOrmModule.forFeature([Interaction, Customer, Contact])],
  controllers: [InteractionsController],
  providers: [InteractionsService],
})
export class InteractionsModule {}
