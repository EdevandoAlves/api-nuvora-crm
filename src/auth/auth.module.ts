import { Module } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Organization } from "src/entity/Organization";
import { User } from "src/entity/User";
import { MailerModule } from "@nestjs-modules/mailer";
import { ConfigService } from "@nestjs/config";

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Organization]),
    MailerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        transport: {
          host: configService.getOrThrow<string>("SMTP_HOST"),
          port: Number.parseInt(
            configService.getOrThrow<string>("SMTP_PORT"),
            10,
          ),
          auth: {
            user: configService.getOrThrow<string>("SMTP_USER"),
            pass: configService.getOrThrow<string>("SMTP_PASS"),
          },
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
