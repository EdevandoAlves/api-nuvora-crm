import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { OrganizationController } from "./controllers/organizations.controller";

export async function OrganizationRouters(fastify: FastifyInstance) {

  fastify.get("/hello", async (req: FastifyRequest, res: FastifyReply) => {
    return "World"
  });

  fastify.post("/auth/register", OrganizationController.register);
}
