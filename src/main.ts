import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import {
  FastifyAdapter,
  NestFastifyApplication,
} from "@nestjs/platform-fastify";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { ValidationPipe } from "@nestjs/common";

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  const config = new DocumentBuilder().setTitle("CRM NUVORA").build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);

  if (process.env.NODE_ENV !== "production") {
    SwaggerModule.setup("api", app, documentFactory);
  }

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
