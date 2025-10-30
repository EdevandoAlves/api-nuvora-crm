import { FastifyReply, FastifyRequest } from "fastify";
import { OrganizationService } from "../services/organizations.service";
import { OrgCreateDTO } from "../dtos/organizations.dto";


const organizationService = new OrganizationService();

export class OrganizationController {
  static async createOrg(req: FastifyRequest<{ Body: OrgCreateDTO }>, res: FastifyReply) {
    try {
      const organization = await organizationService.createOrganization(req.body);
      return res.status(201).send(organization);
    } catch (err) {
      return res.status(400).send({ error: err.message });
    }
  }
} 
