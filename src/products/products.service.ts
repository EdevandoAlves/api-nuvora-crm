import {
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { FindOptionsWhere, ILike, Repository } from "typeorm";
import { TenantContext } from "src/common/utils/tenant-context";
import { DealProduct } from "src/entity/DealProduct";
import { Product } from "src/entity/Product";
import { CreateProductDto } from "./dto/create-product.dto";
import { ProductResponseDto } from "./dto/product-response.dto";
import { QueryProductDto } from "./dto/query-product.dto";
import { UpdateProductDto } from "./dto/update-product.dto";

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
    @InjectRepository(DealProduct)
    private readonly dealProductRepo: Repository<DealProduct>,
  ) {}

  private toResponseDto(product: Product): ProductResponseDto {
    return {
      id: product.id,
      organizationId: product.organizationId,
      name: product.name,
      description: product.description ?? null,
      price: Number(product.price),
      category: product.category ?? null,
      isActive: product.isActive,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };
  }

  async create(
    dto: CreateProductDto,
    { organizationId }: TenantContext,
  ): Promise<ProductResponseDto> {
    const product = this.productRepo.create({
      organizationId,
      name: dto.name,
      description: dto.description,
      price: dto.price,
      category: dto.category,
      isActive: dto.isActive ?? true,
    });
    await this.productRepo.save(product);
    return this.toResponseDto(product);
  }

  async findAll(
    query: QueryProductDto,
    { organizationId }: TenantContext,
  ): Promise<ProductResponseDto[]> {
    const where: FindOptionsWhere<Product> = { organizationId };

    if (query.category) where.category = query.category;
    if (query.isActive !== undefined) where.isActive = query.isActive;
    if (query.search) where.name = ILike(`%${query.search}%`);

    const products = await this.productRepo.find({
      where,
      order: { name: "ASC" },
    });
    return products.map((product) => this.toResponseDto(product));
  }

  async findOne(
    id: string,
    { organizationId }: TenantContext,
  ): Promise<ProductResponseDto> {
    const product = await this.productRepo.findOne({
      where: { id, organizationId },
    });
    if (!product) {
      throw new NotFoundException("Product not found");
    }
    return this.toResponseDto(product);
  }

  async update(
    id: string,
    dto: UpdateProductDto,
    { organizationId }: TenantContext,
  ): Promise<ProductResponseDto> {
    const product = await this.productRepo.findOne({
      where: { id, organizationId },
    });
    if (!product) {
      throw new NotFoundException("Product not found");
    }

    if (dto.name !== undefined) product.name = dto.name;
    if (dto.description !== undefined) {
      product.description = dto.description;
    }
    if (dto.price !== undefined) product.price = dto.price;
    if (dto.category !== undefined) product.category = dto.category;
    if (dto.isActive !== undefined) product.isActive = dto.isActive;

    await this.productRepo.save(product);
    return this.toResponseDto(product);
  }

  async remove(id: string, { organizationId }: TenantContext): Promise<void> {
    const product = await this.productRepo.findOne({
      where: { id, organizationId },
    });
    if (!product) {
      throw new NotFoundException("Product not found");
    }

    const used = await this.dealProductRepo.count({
      where: { productId: product.id },
    });
    if (used > 0) {
      throw new ConflictException("Product is used by a deal");
    }

    await this.productRepo.remove(product);
  }
}
