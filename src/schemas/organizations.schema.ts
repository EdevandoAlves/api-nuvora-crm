import { format } from "path";

export const OrgRegisterSchema = {
  type: "object",
  required: ["name", "slug", "cnpj"],
  properties: {
    name: { type: "string" },
    slug: { type: "string" },
    cnpj: { type: "string" }
  },
} as const;

export const OrgResponseSchema = {
  type: "object",
  properties: {
    id: { type: "string", format: "uuid" },
    name: { type: "string" },
    slug: { type: "string" },
    cnpj: { type: "string" },
    plan: { type: "string", enum: ["FREE", "BASIC", "PRO", "ENTERPRISE"] },
    maxUsers: { type: "integer" },
    isActive: { type: "boolean" },
    subscriptionEndsAt: { type: "string", format: "date-time", nullable: true },
    createdAt: { type: "string", format: "date-time" },
    updatedAt: { type: "string", format: "date-time" },
  },
} as const;


export const OrgSettingsResponseSchema = {
  type: "object",
  properties: {
    id: { type: "string", format: "uuid" },
    name: { type: "string" },
    cnpj: { type: "string" },
    plan: { type: "string", enum: ["FREE", "BASIC", "PRO", "ENTERPRISE"] },
  },
} as const;
