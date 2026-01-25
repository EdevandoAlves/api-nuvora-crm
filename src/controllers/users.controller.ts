import { FastifyReply, FastifyRequest } from "fastify";
import { UserService } from "../services/users.service";
import { forgotPasswordDTO, userCreateDTO, userLoginDTO, resetPasswordParamsDTO, resetPasswordBodyDTO, UserUpdateDTO, UserUpdateParamsDTO, InviteUserDTO, AcceptInvitationParamsDTO, AcceptInvitationBodyDTO, ListUsersQueryDTO, ListUsersByIdDTO, UpdatePasswordParamsDTO, UpdatePasswordBodyDTO, DeactiveUserDTO, ReactiveUserDTO } from "../dtos/users.dto";

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
      const actor = req.user;
      const dataBody = req.body;

      const userUpdated = await userService.updateUser({ actor, target: actor.id, dataBody });
      return res.status(200).send({ userUpdated });
    } catch (err) {
      const status = err.status || 400;
      return res.status(status).send({ error: err.message });
    }
  }

  static async updateUserById(req: FastifyRequest<{ Params: UserUpdateParamsDTO, Body: UserUpdateDTO }>, res: FastifyReply) {
    try {
      const actor = req.user;
      const target = req.params.id;
      const dataBody = req.body;

      const userUpdated = await userService.updateUser({ actor, target, dataBody });
      return res.status(200).send({ userUpdated });
    } catch (err) {
      const status = err.status || 400;
      return res.status(status).send({ error: err.message });
    }
  }

  static async inviteUser(req: FastifyRequest<{ Body: InviteUserDTO }>, res: FastifyReply) {
    try {
      const actor = req.user;
      const dataBody = req.body;

      await userService.inviteUser({ actor, dataBody });
      return res.status(200).send({ message: "If the email exists, a link will be sent." })
    } catch (err) {
      const status = err.status || 400;
      return res.status(status).send({ error: err.message });
    }
  }

  static async acceptInvitation(req: FastifyRequest<{ Params: AcceptInvitationParamsDTO, Body: AcceptInvitationBodyDTO }>, res: FastifyReply) {
    try {
      const { token } = req.params
      const { password } = req.body

      await userService.acceptInvitation({ token, password });
      return res.status(200).send({ message: "Password defined successfully" })
    } catch (err) {
      const status = err.status || 400;
      return res.status(status).send({ error: err.message });
    }
  }

  static async getListUsers(req: FastifyRequest<{ Querystring: ListUsersQueryDTO }>, res: FastifyReply) {
    try {
      const { role, isActive, page = 1, limit = 20 } = req.query
      const actor = req.user

      const result = await userService.listUsers({ actor, queryFilters: { role, isActive }, pagination: { page, limit } });
      const totalPages = Math.ceil(result.total / limit);

      const safeUsers = result.users.map(user => ({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        isActive: user.isActive,
        customerCount: (user as any).customerCount,
        dealCount: (user as any).dealCount,
        createdAt: user.createdAt
      }))

      return res.status(200).send({
        users: safeUsers,
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

  static async getUsersById(req: FastifyRequest<{ Params: ListUsersByIdDTO }>, res: FastifyReply) {
    try {
      const actor = req.user;
      const target = req.params.id;

      const user = await userService.getUsersById({ actor, target })
      return res.status(200).send(user)
    } catch (err) {
      const status = err.status || 400;
      return res.status(status).send({ error: err.message });
    }
  }

  static async changePasswordById(req: FastifyRequest<{ Params: UpdatePasswordParamsDTO, Body: UpdatePasswordBodyDTO }>, res: FastifyReply) {
    try {
      const actor = req.user;
      const target = req.params.id;
      const { currentPassword, newPassword } = req.body

      await userService.updatePassword({ actor, target, currentPassword, newPassword })
      return res.status(200).send({ message: "password updated successfully" })
    } catch (err) {
      const status = err.status || 400;
      return res.status(status).send({ error: err.message });
    }
  }

  static async deactivateUser(req: FastifyRequest<{ Params: DeactiveUserDTO }>, res: FastifyReply) {
    try {
      const actor = req.user;
      const target = req.params.id;

      await userService.deactivateUser({ actor, target })
      return res.status(200).send({
        message: "user successfully deactivated"
      })
    } catch (err) {
      const status = err.status || 400;
      return res.status(status).send({ error: err.message });
    }
  }

  static async reactivateUser(req: FastifyRequest<{ Params: ReactiveUserDTO }>, res: FastifyReply) {
    try {
      const actor = req.user;
      const target = req.params.id;

      await userService.reactivateUser({ actor, target })
      return res.status(200).send({ message: "user successfully reactivate" })
    } catch (err) {
      const status = err.status || 400;
      return res.status(status).send({ error: err.message });
    }
  }
}



