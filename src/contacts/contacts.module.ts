import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Contact } from "src/entity/Contact";
import { Customer } from "src/entity/Customer";
import { Interaction } from "src/entity/Interaction";
import { ContactsController } from "./contacts.controller";
import { ContactsDirectoryController } from "./contacts-directory.controller";
import { ContactsService } from "./contacts.service";

@Module({
  imports: [TypeOrmModule.forFeature([Contact, Customer, Interaction])],
  controllers: [ContactsController, ContactsDirectoryController],
  providers: [ContactsService],
})
export class ContactsModule {}
