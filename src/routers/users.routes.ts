import { FastifyInstance } from "fastify";
import { UserController } from "../controllers/users.controller";
import { UserSettingsResponseSchema, UserUpdateSchema, UserUpdateResponseSchema } from "../schemas/users.schema";
import { authMiddleware } from "../middlewares/auth.middleware";
import { roleMiddleware } from "../middlewares/role.middleware";
import { UserRole } from "../entity/User";

export async function usersRoutes(fastify: FastifyInstance) {
  fastify.get("/me/settings", {
    preHandler: [authMiddleware], schema: {
      response: {
        200: UserSettingsResponseSchema,
      }
    }
  }
    , UserController.getUserProfile);

  fastify.patch("/me/settings",
    {
      preHandler: [authMiddleware], schema: {
        body: UserUpdateSchema,
        response: {
          200: UserUpdateResponseSchema,
        }
      }
    },
    UserController.updateCurrentUser);

  fastify.patch("/users/:id",
    {
      preHandler: [authMiddleware, roleMiddleware([UserRole.ADMIN, UserRole.OWNER])], schema: {
        body: UserUpdateSchema,
        response: {
          200: UserUpdateResponseSchema,
        }
      }
    },
    UserController.updateUserById);

  fastify.post("/users/invite",
    {
      preHandler: [authMiddleware, roleMiddleware([UserRole.ADMIN, UserRole.OWNER])]
    },
    UserController.inviteUser);

  fastify.get("/users",
    {
      preHandler: [authMiddleware, roleMiddleware([UserRole.ADMIN, UserRole.OWNER])]
    }
    , UserController.getListUsers);

  fastify.get("/users/:id",
    {
      preHandler: [authMiddleware, roleMiddleware([UserRole.ADMIN, UserRole.OWNER])]
    }
    , UserController.getUsersById);

  fastify.put("/users/:id/password",
    {
      preHandler: [authMiddleware]
    }
    , UserController.changePasswordById);

  fastify.put("/users/:id/deactivate",
    {
      preHandler: [authMiddleware, roleMiddleware([UserRole.ADMIN, UserRole.OWNER])]
    }
    , UserController.deactivateUser);

  fastify.put("/users/:id/reactivate",
    {
      preHandler: [authMiddleware, roleMiddleware([UserRole.OWNER])]
    }
    , UserController.reactivateUser)
}
