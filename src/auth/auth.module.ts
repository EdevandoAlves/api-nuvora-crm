import { Module } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Organization } from "src/entity/Organization";
import { User } from "src/entity/User";

@Module({
  imports: [TypeOrmModule.forFeature([User, Organization])],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
