import { UserRole } from "src/entity/User";

export type TenantContext = {
  organizationId: string;
  ownerId: string;
  role: UserRole;
};

export const ROLES_WITH_FULL_ACCESS = [
  UserRole.OWNER,
  UserRole.ADMIN,
  UserRole.MANAGER,
];

export function hasFullAccess(role: UserRole): boolean {
  return ROLES_WITH_FULL_ACCESS.includes(role);
}
