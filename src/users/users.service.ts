import { Injectable } from "@nestjs/common";

@Injectable()
export class UsersService {
  getMe(request) {
    return `This action returns a #${id} user`;
  }
}
