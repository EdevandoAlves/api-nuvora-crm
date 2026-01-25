import "reflect-metadata";
import { AppDataSource } from "./data-source";
import fastify, { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import cors from "@fastify/cors";
import { authRoutes } from "./routers/auth.routes";
import { usersRoutes } from "./routers/users.routes";
import { customersRoutes } from "./routers/customers.routes";

const app = fastify({ logger: true });

AppDataSource.initialize()
  .then(async () => {
    console.log("Conectado ao banco!");

    app.register(cors, {});

    app.get("/hello", async (req: FastifyRequest, res: FastifyReply) => {
      return "World"
    });

    app.register(authRoutes);
    app.register(usersRoutes);
    app.register(customersRoutes);

    await app.listen({ port: 8000 });
    console.log("Server started at http://localhost:8000");
  })
  .catch((error) => console.error("Erro ao conectar:", error));
