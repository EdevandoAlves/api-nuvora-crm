import { Module } from "@nestjs/common";
import { CustomersService } from "./customers.service";
import { CustomersController } from "./customers.controller";
import { APP_GUARD } from "@nestjs/core";
import { JwtAuthGuard } from "src/common/guards/jwt-auth.guard";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Customer } from "src/entity/Customer";

@Module({
  imports: [TypeOrmModule.forFeature([Customer])],
  controllers: [CustomersController],
  providers: [CustomersService, { provide: APP_GUARD, useClass: JwtAuthGuard }],
})
export class CustomersModule {}
