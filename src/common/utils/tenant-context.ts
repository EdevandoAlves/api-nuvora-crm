import { UserRole } from "src/entity/User";

export type TenantContext = {
  organizationId: string;
  ownerId: string;
  role: UserRole;
};

export const ROLES_WITH_FULL_ACCESS = [UserRole.ADMIN, UserRole.MANAGER];
