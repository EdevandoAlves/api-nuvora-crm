import { Controller, Get } from "@nestjs/common";
import { AppService } from "./app.service";
import { Public } from "./common/decorators/public.decorator";

@Controller("ping")
export class AppController {
  constructor(private readonly appService: AppService) { }

  @Get()
  @Public()
  pong() {
    return this.appService.pong();
  }
}
