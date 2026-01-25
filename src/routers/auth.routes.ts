import { FastifyInstance } from "fastify";
import { userCreateDTO, userLoginDTO, forgotPasswordDTO, resetPasswordParamsDTO, resetPasswordBodyDTO } from "../dtos/users.dto";
import { UserController } from "../controllers/users.controller";
import { UserCreateSchema, UserResponseSchema, LoginUserSchema, LoginUserResponseSchema } from "../schemas/users.schema";

export async function authRoutes(fastify: FastifyInstance) {
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

  fastify.post("/auth/accept-invitation/:token", UserController.acceptInvitation);
}
