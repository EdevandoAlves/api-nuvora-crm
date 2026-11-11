import { UserRole } from "src/entity/User";
import { hasFullAccess } from "./tenant-context";

describe("hasFullAccess", () => {
  it("allows organization management roles", () => {
    expect(hasFullAccess(UserRole.OWNER)).toBe(true);
    expect(hasFullAccess(UserRole.ADMIN)).toBe(true);
    expect(hasFullAccess(UserRole.MANAGER)).toBe(true);
  });

  it("limits sales and support roles to their own records", () => {
    expect(hasFullAccess(UserRole.SALES)).toBe(false);
    expect(hasFullAccess(UserRole.SUPPORT)).toBe(false);
  });
});
