import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { OrganizationController } from "./controllers/organizations.controller";
import { OrgRegisterSchema, OrgResponseSchema } from "./schemas/organizations.schema";
import { tokenDTO } from "./dtos/organizations.dto";
import { forgotPasswordDTO, resetPasswordBodyDTO, resetPasswordParamsDTO, userCreateDTO, userLoginDTO } from "./dtos/users.dto";
import { UserController } from "./controllers/users.controller";
import { LoginUserResponseSchema, LoginUserSchema, UserCreateSchema, UserResponseSchema } from "./schemas/users.schema";
import { authMiddleware } from "./middlewares/auth.middleware";

export async function Routers(fastify: FastifyInstance) {

  fastify.get("/hello", async (req: FastifyRequest, res: FastifyReply) => {
    return "World"
  });

  fastify.post<{ Body: userCreateDTO }>("/auth/register", {
    schema: {
      body: UserCreateSchema,
      response: {
        201: UserResponseSchema,
      }
    }
  }, UserController.createUser)

  fastify.post<{ Body: userLoginDTO }>("/auth/login", {
    schema: {
      body: LoginUserSchema,
      response: {
        200: LoginUserResponseSchema,
      }
    }
  }, UserController.userLogin)

  fastify.post<{ Body: forgotPasswordDTO }>("/auth/forgot-password", UserController.forgotPassword)

  fastify.post<{ Params: resetPasswordParamsDTO, Body: resetPasswordBodyDTO }>("/auth/reset-password/:token", UserController.resetPassword)

  fastify.post<{ Body: tokenDTO }>("/", {
    schema: {
      body: OrgRegisterSchema,
      response: {
        201: OrgResponseSchema,
      }
    }
  }, OrganizationController.createOrg);

  fastify.get("/me/settings",
    {
      preHandler: [authMiddleware]
    }
    , UserController.meSettings);

  fastify.get("/organization/settings",
    {
      preHandler: [authMiddleware]
    }
    , OrganizationController.orgSettings);

}
