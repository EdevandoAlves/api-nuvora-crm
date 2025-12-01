import { FastifyReply, FastifyRequest } from "fastify";
import { OrganizationService } from "../services/organizations.service";
import { tokenDTO } from "../dtos/organizations.dto";


const organizationService = new OrganizationService();

export class OrganizationController {
  static async createOrg(req: FastifyRequest<{ Body: tokenDTO }>, res: FastifyReply) {
    try {
      const organization = await organizationService.createOrganization(req.body);
      return res.status(201).send(organization);
    } catch (err) {
      const status = err.status || 400;
      return res.status(status).send({ error: err.message });
    }
  }

  static async orgSettings(req: FastifyRequest, res: FastifyReply) {
    try {
      const organization = await organizationService.orgSettings(req.user);
      return res.status(201).send(organization)
    } catch (err) {
      const status = err.status || 400;
      return res.status(status).send({ error: err.message });
    }
  }
} 
