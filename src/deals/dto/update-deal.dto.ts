import { OmitType, PartialType } from "@nestjs/swagger";
import { CreateDealDto } from "./create-deal.dto";

/**
 * Stage and lostReason have their own endpoint (`PATCH /deals/:id/stage`).
 * Keeping them out of the general update keeps the stage invariants in one
 * place instead of silently ignoring them here.
 */
export class UpdateDealDto extends PartialType(
  OmitType(CreateDealDto, ["stage", "lostReason"] as const),
) {}
