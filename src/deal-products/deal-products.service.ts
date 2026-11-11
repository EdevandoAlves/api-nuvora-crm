import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { hasFullAccess, TenantContext } from "src/common/utils/tenant-context";
import { DealProduct } from "src/entity/DealProduct";
import { Deal } from "src/entity/Deal";
import { Product } from "src/entity/Product";
import { CreateDealProductDto } from "./dto/create-deal-product.dto";
import { DealProductResponseDto } from "./dto/deal-product-response.dto";
import { UpdateDealProductDto } from "./dto/update-deal-product.dto";

function round2(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function totalPrice(
  quantity: number,
  unitPrice: number,
  discount: number,
): number {
  return round2(quantity * unitPrice * (1 - discount / 100));
}

@Injectable()
export class DealProductsService {
  constructor(
    @InjectRepository(DealProduct)
    private readonly dealProductRepo: Repository<DealProduct>,
    @InjectRepository(Deal)
    private readonly dealRepo: Repository<Deal>,
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
  ) {}

  private async requireDeal(
    dealId: string,
    { ownerId, organizationId, role }: TenantContext,
  ): Promise<Deal> {
    const where = hasFullAccess(role)
      ? { id: dealId, organizationId }
      : { id: dealId, organizationId, ownerId };

    const deal = await this.dealRepo.findOne({ where });
    if (!deal) {
      throw new NotFoundException("Deal not found");
    }
    return deal;
  }

  private async requireProduct(
    productId: string,
    organizationId: string,
  ): Promise<Product> {
    const product = await this.productRepo.findOne({
      where: { id: productId, organizationId, isActive: true },
    });
    if (!product) {
      throw new NotFoundException("Product not found");
    }
    return product;
  }

  private async requireLine(dealId: string, id: string): Promise<DealProduct> {
    const line = await this.dealProductRepo.findOne({
      where: { id, dealId },
      relations: { product: true },
    });
    if (!line) {
      throw new NotFoundException("Deal product not found");
    }
    return line;
  }

  private toResponseDto(line: DealProduct): DealProductResponseDto {
    return {
      id: line.id,
      dealId: line.dealId,
      productId: line.productId,
      productName: line.product?.name ?? null,
      quantity: line.quantity,
      unitPrice: Number(line.unitPrice),
      discount: Number(line.discount),
      totalPrice: Number(line.totalPrice),
    };
  }

  async findAll(
    dealId: string,
    ctx: TenantContext,
  ): Promise<DealProductResponseDto[]> {
    await this.requireDeal(dealId, ctx);
    const lines = await this.dealProductRepo.find({
      where: { dealId },
      relations: { product: true },
      order: { id: "ASC" },
    });
    return lines.map((line) => this.toResponseDto(line));
  }

  async create(
    dealId: string,
    dto: CreateDealProductDto,
    ctx: TenantContext,
  ): Promise<DealProductResponseDto> {
    const deal = await this.requireDeal(dealId, ctx);
    const product = await this.requireProduct(
      dto.productId,
      deal.organizationId,
    );

    const unitPrice = dto.unitPrice ?? Number(product.price);
    const discount = dto.discount ?? 0;
    const line = this.dealProductRepo.create({
      dealId: deal.id,
      productId: product.id,
      quantity: dto.quantity,
      unitPrice,
      discount,
      totalPrice: totalPrice(dto.quantity, unitPrice, discount),
    });
    line.product = product;

    await this.dealProductRepo.save(line);
    return this.toResponseDto(line);
  }

  async update(
    dealId: string,
    id: string,
    dto: UpdateDealProductDto,
    ctx: TenantContext,
  ): Promise<DealProductResponseDto> {
    await this.requireDeal(dealId, ctx);
    const line = await this.requireLine(dealId, id);

    if (dto.quantity !== undefined) line.quantity = dto.quantity;
    if (dto.unitPrice !== undefined) line.unitPrice = dto.unitPrice;
    if (dto.discount !== undefined) line.discount = dto.discount;

    line.totalPrice = totalPrice(
      line.quantity,
      Number(line.unitPrice),
      Number(line.discount),
    );

    await this.dealProductRepo.save(line);
    return this.toResponseDto(line);
  }

  async remove(dealId: string, id: string, ctx: TenantContext): Promise<void> {
    await this.requireDeal(dealId, ctx);
    const line = await this.requireLine(dealId, id);
    await this.dealProductRepo.remove(line);
  }
}
