import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { OrganizationController } from "./controllers/organizations.controller";
import { OrgRegisterSchema, OrgResponseSchema } from "./schemas/organizations.schema";
import { OrgRegisterDTO } from "./dtos/organizations.dto";

export async function OrganizationRouters(fastify: FastifyInstance) {

  fastify.get("/hello", async (req: FastifyRequest, res: FastifyReply) => {
    return "World"
  });

  fastify.post<{ Body: OrgRegisterDTO }>("/auth/", {
    schema: {
      body: OrgRegisterSchema,
      response: {
        201: OrgResponseSchema,
      }
    }
  }, OrganizationController.createOrg);
}
