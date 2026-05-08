export type UserRole = 'guest' | 'admin' | 'devops' | 'developer';

export interface User {
  id: string;
  email: string;
  name: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isBlocked: boolean;
  isSuperAdmin?: boolean;
  createdAt: string;
}