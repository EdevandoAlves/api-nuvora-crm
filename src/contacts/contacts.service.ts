import {
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { hasFullAccess, TenantContext } from "src/common/utils/tenant-context";
import { Contact } from "src/entity/Contact";
import { Customer } from "src/entity/Customer";
import { Interaction } from "src/entity/Interaction";
import { ContactResponseDto } from "./dto/contact-response.dto";
import { CreateContactDto } from "./dto/create-contact.dto";
import { UpdateContactDto } from "./dto/update-contact.dto";

@Injectable()
export class ContactsService {
  constructor(
    @InjectRepository(Contact)
    private readonly contactRepo: Repository<Contact>,
    @InjectRepository(Customer)
    private readonly customerRepo: Repository<Customer>,
    @InjectRepository(Interaction)
    private readonly interactionRepo: Repository<Interaction>,
  ) {}

  private async requireCustomer(
    customerId: string,
    { ownerId, organizationId, role }: TenantContext,
  ): Promise<Customer> {
    const where = hasFullAccess(role)
      ? { id: customerId, organizationId }
      : { id: customerId, organizationId, ownerId };

    const customer = await this.customerRepo.findOne({ where });
    if (!customer) {
      throw new NotFoundException("Customer not found");
    }
    return customer;
  }

  private async requireContact(
    customerId: string,
    contactId: string,
    organizationId: string,
  ): Promise<Contact> {
    const contact = await this.contactRepo.findOne({
      where: { id: contactId, customerId, organizationId },
    });
    if (!contact) {
      throw new NotFoundException("Contact not found");
    }
    return contact;
  }

  private toResponseDto(contact: Contact): ContactResponseDto {
    return {
      id: contact.id,
      organizationId: contact.organizationId,
      customerId: contact.customerId,
      firstName: contact.firstName,
      lastName: contact.lastName,
      email: contact.email ?? null,
      phone: contact.phone ?? null,
      position: contact.position ?? null,
      isPrimary: contact.isPrimary,
      linkedin: contact.linkedin ?? null,
      notes: contact.notes ?? null,
      createdAt: contact.createdAt,
      updatedAt: contact.updatedAt,
    };
  }

  private async saveContact(contact: Contact): Promise<Contact> {
    if (!contact.isPrimary) {
      return this.contactRepo.save(contact);
    }

    return this.contactRepo.manager.transaction(async (manager) => {
      await manager.update(
        Contact,
        {
          organizationId: contact.organizationId,
          customerId: contact.customerId,
          isPrimary: true,
        },
        { isPrimary: false },
      );
      return manager.save(contact);
    });
  }

  async create(
    customerId: string,
    dto: CreateContactDto,
    ctx: TenantContext,
  ): Promise<ContactResponseDto> {
    const customer = await this.requireCustomer(customerId, ctx);
    const contact = this.contactRepo.create({
      organizationId: customer.organizationId,
      customerId: customer.id,
      firstName: dto.firstName,
      lastName: dto.lastName,
      email: dto.email,
      phone: dto.phone,
      position: dto.position,
      linkedin: dto.linkedin,
      notes: dto.notes,
      isPrimary: dto.isPrimary ?? false,
    });

    const saved = await this.saveContact(contact);
    return this.toResponseDto(saved);
  }

  async findAll(
    customerId: string,
    ctx: TenantContext,
  ): Promise<ContactResponseDto[]> {
    const customer = await this.requireCustomer(customerId, ctx);
    const contacts = await this.contactRepo.find({
      where: {
        organizationId: customer.organizationId,
        customerId: customer.id,
      },
      order: { isPrimary: "DESC", firstName: "ASC", lastName: "ASC" },
    });
    return contacts.map((contact) => this.toResponseDto(contact));
  }

  async findOne(
    customerId: string,
    contactId: string,
    ctx: TenantContext,
  ): Promise<ContactResponseDto> {
    const customer = await this.requireCustomer(customerId, ctx);
    const contact = await this.requireContact(
      customer.id,
      contactId,
      customer.organizationId,
    );
    return this.toResponseDto(contact);
  }

  async update(
    customerId: string,
    contactId: string,
    dto: UpdateContactDto,
    ctx: TenantContext,
  ): Promise<ContactResponseDto> {
    const customer = await this.requireCustomer(customerId, ctx);
    const contact = await this.requireContact(
      customer.id,
      contactId,
      customer.organizationId,
    );

    if (dto.firstName !== undefined) contact.firstName = dto.firstName;
    if (dto.lastName !== undefined) contact.lastName = dto.lastName;
    if (dto.email !== undefined) contact.email = dto.email;
    if (dto.phone !== undefined) contact.phone = dto.phone;
    if (dto.position !== undefined) contact.position = dto.position;
    if (dto.linkedin !== undefined) contact.linkedin = dto.linkedin;
    if (dto.notes !== undefined) contact.notes = dto.notes;
    if (dto.isPrimary !== undefined) contact.isPrimary = dto.isPrimary;

    const saved = await this.saveContact(contact);
    return this.toResponseDto(saved);
  }

  async remove(
    customerId: string,
    contactId: string,
    ctx: TenantContext,
  ): Promise<void> {
    const customer = await this.requireCustomer(customerId, ctx);
    const contact = await this.requireContact(
      customer.id,
      contactId,
      customer.organizationId,
    );

    const interactions = await this.interactionRepo.count({
      where: {
        organizationId: customer.organizationId,
        contactId: contact.id,
      },
    });
    if (interactions > 0) {
      throw new ConflictException(
        "Contact has interactions and cannot be removed",
      );
    }

    await this.contactRepo.remove(contact);
  }
}
