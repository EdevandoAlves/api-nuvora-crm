import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Customer } from "src/entity/Customer";
import { Deal } from "src/entity/Deal";
import { Task } from "src/entity/Task";
import { User } from "src/entity/User";
import { TasksController } from "./tasks.controller";
import { TasksService } from "./tasks.service";

@Module({
  imports: [TypeOrmModule.forFeature([Task, Customer, Deal, User])],
  controllers: [TasksController],
  providers: [TasksService],
})
export class TasksModule {}
