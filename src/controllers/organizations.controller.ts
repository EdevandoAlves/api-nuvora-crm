import { FastifyReply, FastifyRequest } from "fastify";
import { OrganizationService } from "../services/organizations.service";

const organizationService = new OrganizationService();

export class OrganizationController {
  static async register(req: FastifyRequest, res: FastifyReply) {
    try {
      const organization = await organizationService.createOrganization(req.body as { name: string, slug: string, cnpj: string });
      return res.status(201).send(organization);
    } catch (err) {
      return res.status(400).send({ error: err.message });
    }
  }
} 
