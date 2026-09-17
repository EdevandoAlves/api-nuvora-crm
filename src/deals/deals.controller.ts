import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
} from "@nestjs/common";
import { DealsService } from "./deals.service";
import { CreateDealDto } from "./dto/create-deal.dto";
import { UpdateDealDto } from "./dto/update-deal.dto";
import type { AuthRequest } from "src/common/guards/jwt-auth.guard";

@Controller("deals")
export class DealsController {
  constructor(private readonly dealsService: DealsService) { }

  @Post()
  create(@Body() createDealDto: CreateDealDto, @Req() request: AuthRequest) {
    return this.dealsService.create(createDealDto, {
      ownerId: request.user!.id,
      organizationId: request.user!.organization,
      role: request.user!.role,
    });
  }

  @Get()
  findAll() {
    return this.dealsService.findAll();
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.dealsService.findOne(+id);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() updateDealDto: UpdateDealDto) {
    return this.dealsService.update(+id, updateDealDto);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.dealsService.remove(+id);
  }
}
