import { FastifyInstance } from "fastify";
import { authMiddleware } from "../middlewares/auth.middleware";
import { roleMiddleware } from "../middlewares/role.middleware";
import { UserRole } from "../entity/User";
import { CustomerController } from "../controllers/customers.controller";

export async function customersRoutes(fastify: FastifyInstance) {
  fastify.post("/customers",
    {
      preHandler: [authMiddleware, roleMiddleware([UserRole.SALES, UserRole.MANAGER, UserRole.ADMIN, UserRole.OWNER])]
    }
    , CustomerController.createCustomer);

  fastify.get("/customers",
    {
      preHandler: [authMiddleware, roleMiddleware([UserRole.SALES, UserRole.MANAGER, UserRole.ADMIN, UserRole.OWNER])]
    }
    , CustomerController.getCustomers);

  fastify.get("/customers/search",
    {
      preHandler: [authMiddleware]
    }
    , CustomerController.searchCustomers)
}
