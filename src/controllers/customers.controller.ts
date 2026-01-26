import { FastifyReply, FastifyRequest } from "fastify";
import { CustomerService } from "../services/customers.service";
import { CustomerCreateDTO, GetCustomerParamsDTO, searchCustomerParamsDTO } from "../dtos/customers.dto";

const customerService = new CustomerService();

export class CustomerController {
  static async createCustomer(req: FastifyRequest<{ Body: CustomerCreateDTO }>, res: FastifyReply) {
    try {
      const actor = req.user;
      const dataBody = req.body;

      const customer = await customerService.createCustomer({ actor, dataBody });
      return res.status(200).send({ customer })
    } catch (err) {
      const status = err.status || 400;
      return res.status(status).send({ error: err.message });
    }
  }

  static async getCustomers(req: FastifyRequest<{ Params: GetCustomerParamsDTO }>, res: FastifyReply) {
    try {
      const actor = req.user;
      const { industry, limit, page, status } = req.params;

      const result = await customerService.listCustomers({ actor, queryFilters: { status, industry }, pagination: { limit, page } });
      const totalPages = Math.ceil(result.total / limit);

      const safeCustomers = result.customers.map(customer => ({
        id: customer.id,
        companyName: customer.companyName,
        cnpj: customer.cnpj,
        status: customer.status,
        address: customer.address,
      }));

      return res.status(200).send({
        customer: safeCustomers,
        pagination: {
          total: result.total,
          page,
          limit,
          totalPages
        }
      })
    } catch (err) {
      const status = err.status || 400;
      return res.status(status).send({ error: err.message });
    }
  }

  static async searchCustomers(req: FastifyRequest<{ Querystring: searchCustomerParamsDTO }>, res: FastifyReply) {
    try {
      const actor = req.user;
      const queryFilters = req.query

      const customers = await customerService.searchCustomers({ actor, queryFilters });
      return res.status(200).send({ customers });
    } catch (err) {
      const status = err.status || 400;
      return res.status(status).send({ error: err.message });
    }
  }
}
