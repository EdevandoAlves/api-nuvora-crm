import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Organization } from "src/entity/Organization";
import { User } from "src/entity/User";
import { UsersService } from "./users.service";
import { UsersController } from "./users.controller";

@Module({
  imports: [TypeOrmModule.forFeature([User, Organization])],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
