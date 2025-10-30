import { FastifyReply, FastifyRequest } from "fastify";
import { UserService } from "../services/users.service";
import { userCreateDTO, userLoginDTO } from "../dtos/users.dto";

const userService = new UserService();

export class UserController {
  static async createUser(req: FastifyRequest<{ Body: userCreateDTO }>, res: FastifyReply) {
    try {
      const user = await userService.createUser(req.body);
      return res.status(201).send(user);
    } catch (err) {
      return res.status(400).send({ error: err.message });
    }
  }

  static async userLogin(req: FastifyRequest<{ Body: userLoginDTO }>, res: FastifyReply) {
    try {
      const user = await userService.userLogin(req.body);
      return res.status(201).send(user);
    } catch (err) {
      return res.status(400).send({ error: err.message });
    }
  }
}
