import { Injectable } from "@nestjs/common";

@Injectable()
export class AppService {
  pong() {
    return "Pong";
  }
}
