import { FastifyReply, FastifyRequest } from "fastify";
import { CustomerService } from "../services/customers.service";
import { CustomerCreateDTO } from "../dtos/customers.dto";

const customerService = new CustomerService();

export class CustomerController {
  static async createCustomer(req: FastifyRequest<{ Body: CustomerCreateDTO }>, res: FastifyReply) {
    try {
      const actor = req.user;
      const dataBody = req.body

      const customer = await customerService.createCustomer({ actor, dataBody });
      return res.status(200).send({ customer })
    } catch (err) {
      const status = err.status || 400;
      return res.status(status).send({ error: err.message });
    }
  }
}
