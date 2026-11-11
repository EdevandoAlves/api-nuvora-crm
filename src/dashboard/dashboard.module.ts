import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Customer } from "src/entity/Customer";
import { Deal } from "src/entity/Deal";
import { Interaction } from "src/entity/Interaction";
import { Task } from "src/entity/Task";
import { DashboardController } from "./dashboard.controller";
import { DashboardService } from "./dashboard.service";

@Module({
  imports: [TypeOrmModule.forFeature([Customer, Deal, Task, Interaction])],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
