export const UserCreateSchema = {
  type: "object",
  required: ["email", "password", "firstName", "lastName", "companyName", "cnpj"],
  properties: {
    email: { type: "string", format: "email" },
    password: { type: "string" },
    firstName: { type: "string" },
    lastName: { type: "string" },
    companyName: { type: "string" },
    cnpj: { type: "string", minLength: 14, maxLength: 14 },
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

export const LoginUserSchema = {
  type: "object",
  required: ["email", "password"],
  properties: {
    email: {
      type: "string",
      format: "email",
      description: "User email address"
    },
    password: {
      type: "string",
      minLength: 1,
      description: "User password"
    }
  },
  additionalProperties: false,
} as const;

export const LoginUserResponseSchema = {
  type: "object",
  required: ["token"],
  properties: {
    token: {
      type: "string",
      description: "JWT authentication token"
    }
  }
} as const;

export const ForgotPasswordSchema = {
  type: "object",
  required: ["email"],
  properties: {
    email: {
      type: "string",
      format: "email",
      description: "User email address for password recovery"
    }
  },
  additionalProperties: false,
} as const;

export const UserSettingsResponseSchema = {
  type: "object",
  properties: {
    id: { type: "string", format: "uuid" },
    organizationId: { type: "string" },
    email: { type: "string" },
    firstName: { type: "string" },
    lastName: { type: "string" },
  },
} as const;

export const UserUpdateSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    firstName: { type: 'string', minLength: 2, maxLength: 50 },
    lastName: { type: 'string', minLength: 2, maxLength: 50 }
  },
  minProperties: 1
}

export const UserUpdateResponseSchema = {
  type: "object",
  properties: {
    firstName: { type: 'string' },
    lastName: { type: 'string' }
  },
}

