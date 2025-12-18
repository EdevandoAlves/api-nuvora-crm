import { FastifyReply, FastifyRequest } from "fastify";
import { UserService } from "../services/users.service";
import { forgotPasswordDTO, userCreateDTO, userLoginDTO, resetPasswordParamsDTO, resetPasswordBodyDTO, UserUpdateDTO, UserUpdateParamsDTO, InviteUserDTO, AcceptInvitationParamsDTO, AcceptInvitationBodyDTO } from "../dtos/users.dto";

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

  static async getUserProfile(req: FastifyRequest, res: FastifyReply) {
    try {
      const user = await userService.getUserProfile(req.user);
      return res.status(200).send({ user });
    } catch (err) {
      const status = err.status || 400;
      return res.status(status).send({ error: err.message });
    }
  }

  static async updateCurrentUser(req: FastifyRequest<{ Body: UserUpdateDTO }>, res: FastifyReply) {
    try {
      const userUpdated = await userService.updateUser(req.user, req.user.id, req.body);
      return res.status(200).send({ userUpdated });
    } catch (err) {
      const status = err.status || 400;
      return res.status(status).send({ error: err.message });
    }
  }

  static async updateUserById(req: FastifyRequest<{ Params: UserUpdateParamsDTO, Body: UserUpdateDTO }>, res: FastifyReply) {
    try {
      const userUpdated = await userService.updateUser(req.user, req.params.id, req.body);
      return res.status(200).send({ userUpdated });
    } catch (err) {
      const status = err.status || 400;
      return res.status(status).send({ error: err.message });
    }
  }

  static async inviteUser(req: FastifyRequest<{ Body: InviteUserDTO }>, res: FastifyReply) {
    try {
      await userService.inviteUser(req.user, req.body);
      return res.status(200).send({ message: "If the email exists, a link will be sent." })
    } catch (err) {
      const status = err.status || 400;
      return res.status(status).send({ error: err.message });
    }
  }

  static async acceptInvitation(req: FastifyRequest<{ Params: AcceptInvitationParamsDTO, Body: AcceptInvitationBodyDTO }>, res: FastifyReply) {
    try {
      await userService.acceptInvitation(req.params, req.body);
      return res.status(200).send({ message: "Password defined successfully" })
    } catch (err) {
      const status = err.status || 400;
      return res.status(status).send({ error: err.message });
    }
  }
}
