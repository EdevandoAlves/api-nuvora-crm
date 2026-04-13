import { FastifyInstance } from "fastify";
import { authMiddleware } from "../middlewares/auth.middleware";
import { roleMiddleware } from "../middlewares/role.middleware";
import { User, UserRole } from "../entity/User";
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
    , CustomerController.searchCustomers);

  fastify.get("/customers/:id",
    {
      preHandler: [authMiddleware, roleMiddleware([UserRole.SALES, UserRole.MANAGER, UserRole.ADMIN, UserRole.OWNER])]
    }
    , CustomerController.getCustomerDetails);

  fastify.put("/customers/:id",
    {
      preHandler: [authMiddleware, roleMiddleware([UserRole.MANAGER, UserRole.ADMIN, UserRole.OWNER])]
    }
    , CustomerController.updateCustomer);

  fastify.put("/customers/:id/transfer",
    {
      preHandler: [authMiddleware, roleMiddleware([UserRole.MANAGER, UserRole.ADMIN, UserRole.OWNER])]
    }
    , CustomerController.transferCustomerOwnership);

}
