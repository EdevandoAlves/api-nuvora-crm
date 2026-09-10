import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuthModule } from "./auth/auth.module";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { Contact } from "./entity/Contact";
import { Customer } from "./entity/Customer";
import { Deal } from "./entity/Deal";
import { DealProduct } from "./entity/DealProduct";
import { Interaction } from "./entity/Interaction";
import { Organization } from "./entity/Organization";
import { Product } from "./entity/Product";
import { Task } from "./entity/Task";
import { User } from "./entity/User";
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler";
import { APP_GUARD } from "@nestjs/core";
import { UsersModule } from "./users/users.module";

@Module({
  controllers: [AppController],
  providers: [AppService, { provide: APP_GUARD, useClass: ThrottlerGuard }],
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: "postgres",
        host: configService.get<string>("TYPEORM_HOST"),
        port: Number.parseInt(
          configService.get<string>("TYPEORM_PORT") ?? "5432",
          10,
        ),
        username: configService.get<string>("TYPEORM_USERNAME"),
        password: configService.get<string>("TYPEORM_PASSWORD"),
        database: configService.get<string>("TYPEORM_DATABASE"),
        entities: [
          Contact,
          Customer,
          Deal,
          DealProduct,
          Interaction,
          Organization,
          Product,
          Task,
          User,
        ],
        autoLoadEntities: true,
        synchronize: false,
        migrationsRun: false,
        dropSchema: false,
      }),
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60_000,
        limit: 60,
      },
    ]),
    AuthModule,
    UsersModule,
  ],
})
export class AppModule {}
