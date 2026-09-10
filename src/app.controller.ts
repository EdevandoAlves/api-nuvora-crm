import { Controller, Get } from "@nestjs/common";
import { AppService } from "./app.service";

@Controller("ping")
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  pong() {
    return this.appService.pong();
  }
}
