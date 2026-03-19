export type UserRole = "admin" | "devops" | "developer";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}