import { FastifyReply, FastifyRequest } from "fastify";
import { UserService } from "../services/users.service";
import { forgotPasswordDTO, userCreateDTO, userLoginDTO, resetPasswordParamsDTO, resetPasswordBodyDTO, UserUpdateDTO } from "../dtos/users.dto";

const userService = new UserService();

export class UserController {
  static async createUser(req: FastifyRequest<{ Body: userCreateDTO }>, res: FastifyReply) {
    try {
      const user = await userService.createUser(req.body);
      return res.status(201).send({ user });
    } catch (err) {
      const status = err.status || 400;
      return res.status(status).send({ error: err.message });
    }
  }

  static async userLogin(req: FastifyRequest<{ Body: userLoginDTO }>, res: FastifyReply) {
    try {
      const token = await userService.userLogin(req.body);
      return res.status(200).send({ token });
    } catch (err) {
      const status = err.status || 400;
      return res.status(status).send({ error: err.message });
    }
  }

  static async forgotPassword(req: FastifyRequest<{ Body: forgotPasswordDTO }>, res: FastifyReply) {
    try {
      await userService.forgotPassword(req.body);
      return res.status(200).send({ message: "If the email exists, a password reset link will be sent." });
    } catch (err) {
      const status = err.status || 400;
      return res.status(status).send({ error: err.message });
    }
  }

  static async resetPassword(req: FastifyRequest<{ Params: resetPasswordParamsDTO, Body: resetPasswordBodyDTO }>, res: FastifyReply) {
    try {
      await userService.resetPassword(req.params, req.body);
      return res.status(200).send({ message: "Password reset successfully." });
    } catch (err) {
      const status = err.status || 400;
      return res.status(status).send({ error: err.message });
    }
  }

  static async meSettings(req: FastifyRequest, res: FastifyReply) {
    try {
      const user = await userService.meSettings(req.user);
      return res.status(200).send({ user });
    } catch (err) {
      const status = err.status || 400;
      return res.status(status).send({ error: err.message });
    }
  }

  static async meUpdate(req: FastifyRequest<{ Body: UserUpdateDTO }>, res: FastifyReply) {
    try {
      const userUpdated = await userService.meUpdate(req.body, req.user);
      return res.status(200).send({ userUpdated });
    } catch (err) {
      const status = err.status || 400;
      return res.status(status).send({ error: err.message });
    }
  }
}
