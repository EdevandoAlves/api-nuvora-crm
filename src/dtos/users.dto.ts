export interface userBase {
  email?: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  companyName?: string;
  cnpj?: string;
  avatar?: string
}

export interface userCreateDTO extends Required<Pick<userBase, "email" | "password" | "firstName" | "lastName" | "companyName" | "cnpj">
> {
  avatar?: string;
}

export interface userLoginDTO extends Pick<userCreateDTO, "email" | "password"> { }

export interface forgotPasswordDTO extends Pick<userCreateDTO, "email"> { }

export interface resetPasswordBodyDTO extends Pick<userCreateDTO, "password"> { }

export interface resetPasswordParamsDTO {
  token: string;
}

export type UserUpdateDTO = Partial<
  Pick<userBase, "firstName" | "lastName">
>;

