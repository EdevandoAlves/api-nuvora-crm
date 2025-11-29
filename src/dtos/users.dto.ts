import { createPublicKey } from "crypto";

export interface userCreateDTO {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  companyName: string;
  cnpj: string;
  avatar?: string
}

export interface userLoginDTO extends Pick<userCreateDTO, "email" | "password"> { }

export interface forgotPasswordDTO extends Pick<userCreateDTO, "email"> { }

export interface resetPasswordBodyDTO extends Pick<userCreateDTO, "password"> { }

export interface resetPasswordParamsDTO {
  token: string;
}
