import { cookies } from "next/headers";

export type Role = "Borrower" | "Owner" | "Supervisor" | "Admin";

export interface DemoUser {
  id: string;
  email: string;
  fullName: string;
  role: Role;
  department: string;
}

export const MOCK_USERS: Record<Role, DemoUser> = {
  Borrower: {
    id: "11111111-1111-4111-a111-111111111111",
    email: "borrower@lab.edu",
    fullName: "Alex Chen (Borrower)",
    role: "Borrower",
    department: "Biomedical Engineering",
  },
  Owner: {
    id: "22222222-2222-4222-a222-222222222222",
    email: "owner@lab.edu",
    fullName: "Dr. Sarah Jenkins (Owner)",
    role: "Owner",
    department: "Physics & Photonics",
  },
  Supervisor: {
    id: "33333333-3333-4333-a333-333333333333",
    email: "supervisor@lab.edu",
    fullName: "Prof. Robert Vance (Supervisor)",
    role: "Supervisor",
    department: "Safety & Compliance",
  },
  Admin: {
    id: "44444444-4444-4444-a444-444444444444",
    email: "admin@lab.edu",
    fullName: "System Administrator",
    role: "Admin",
    department: "Central Research Facility",
  },
};

/**
 * Gets the current active role profile on the server side.
 */
export async function getCurrentUser(): Promise<DemoUser> {
  const cookieStore = await cookies();
  const activeRole = (cookieStore.get("labledger_role")?.value as Role) || "Borrower";
  return MOCK_USERS[activeRole] || MOCK_USERS.Borrower;
}