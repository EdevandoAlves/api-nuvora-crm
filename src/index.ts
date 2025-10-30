import "reflect-metadata";
import { AppDataSource } from "./data-source";
import fastify from "fastify";
import cors from "@fastify/cors";
import { OrganizationRouters } from "./routers";

const app = fastify({ logger: true });

AppDataSource.initialize()
  .then(async () => {
    console.log("Conectado ao banco!");

    app.register(cors, {});
    app.register(OrganizationRouters);

    await app.listen({ port: 8000 });
    console.log("Server started at http://localhost:8000");
  })
  .catch((error) => console.error("Erro ao conectar:", error));
