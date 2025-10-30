import { UserRole } from "../entity/User";

export const UserCreateSchema = {
  type: "object",
  required: ["email", "password", "firstName", "lastName", "companyName", "cnpj"],
  properties: {
    email: { type: "string", format: "email" },
    password: { type: "string" },
    firstName: { type: "string" },
    lastName: { type: "string" },
    companyName: { type: "string" },
    cnpj: { type: "string" },
  },
} as const;

export const UserResponseSchema = {
  type: "object",
  properties: {
    email: { type: "string", format: "email" },
    firstName: { type: "string" },
    lastName: { type: "string" },
  },
} as const;

