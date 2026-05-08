import type { User, UserRole } from '../models/User';
import { SUPER_ADMIN_EMAIL } from '../authConfig';

const USERS_STORAGE_KEY = 'manageme-users';

interface GoogleUserData {
  email: string;
  firstName: string;
  lastName: string;
}

export class UserStorageApi {
  private getUsersFromStorage(): User[] {
    const usersJson = localStorage.getItem(USERS_STORAGE_KEY);

    if (!usersJson) {
      return [];
    }

    try {
      return JSON.parse(usersJson) as User[];
    } catch {
      return [];
    }
  }

  private saveUsersToStorage(users: User[]): void {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  }

  getUsers(): User[] {
    return this.getUsersFromStorage();
  }

  getUserById(userId: string): User | undefined {
    return this.getUsersFromStorage().find((user) => user.id === userId);
  }

  getUserByEmail(email: string): User | undefined {
    return this.getUsersFromStorage().find(
      (user) => user.email.toLowerCase() === email.toLowerCase()
    );
  }

  createOrGetUserFromGoogle(googleUserData: GoogleUserData): {
    user: User;
    isNewUser: boolean;
  } {
    const users = this.getUsersFromStorage();

    const existingUser = users.find(
      (user) =>
        user.email.toLowerCase() === googleUserData.email.toLowerCase()
    );

    if (existingUser) {
      return {
        user: existingUser,
        isNewUser: false,
      };
    }

    const isSuperAdmin =
      googleUserData.email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase();

    const newUser: User = {
      id: crypto.randomUUID(),
      email: googleUserData.email,
      name: `${googleUserData.firstName} ${googleUserData.lastName}`,
      firstName: googleUserData.firstName,
      lastName: googleUserData.lastName,
      role: isSuperAdmin ? 'admin' : 'guest',
      isBlocked: false,
      isSuperAdmin,
      createdAt: new Date().toISOString(),
    };

    this.saveUsersToStorage([...users, newUser]);

    return {
      user: newUser,
      isNewUser: true,
    };
  }

  updateUserRole(userId: string, role: UserRole): User | undefined {
    const users = this.getUsersFromStorage();

    const updatedUsers = users.map((user) => {
      if (user.id !== userId) {
        return user;
      }

      if (user.isSuperAdmin) {
        return user;
      }

      return {
        ...user,
        role,
      };
    });

    this.saveUsersToStorage(updatedUsers);

    return updatedUsers.find((user) => user.id === userId);
  }

  blockUser(userId: string): User | undefined {
    const users = this.getUsersFromStorage();

    const updatedUsers = users.map((user) => {
      if (user.id !== userId) {
        return user;
      }

      if (user.isSuperAdmin) {
        return user;
      }

      return {
        ...user,
        isBlocked: true,
      };
    });

    this.saveUsersToStorage(updatedUsers);

    return updatedUsers.find((user) => user.id === userId);
  }

  unblockUser(userId: string): User | undefined {
    const users = this.getUsersFromStorage();

    const updatedUsers = users.map((user) => {
      if (user.id !== userId) {
        return user;
      }

      return {
        ...user,
        isBlocked: false,
      };
    });

    this.saveUsersToStorage(updatedUsers);

    return updatedUsers.find((user) => user.id === userId);
  }

  deleteAllUsers(): void {
    localStorage.removeItem(USERS_STORAGE_KEY);
  }
}

export const userStorageApi = new UserStorageApi();

/**
 * Legacy exports — zostawione tymczasowo,
 * żeby stary App.tsx działał do czasu przebudowy auth w LAB06.
 */

export const getUsers = (): User[] => {
  return userStorageApi.getUsers();
};

export const getLoggedUser = (): User => {
  const users = userStorageApi.getUsers();

  const existingSuperAdmin = users.find((user) => user.isSuperAdmin);

  if (existingSuperAdmin) {
    return existingSuperAdmin;
  }

  const superAdminUser: User = {
    id: crypto.randomUUID(),
    email: SUPER_ADMIN_EMAIL,
    name: 'Super Admin',
    firstName: 'Super',
    lastName: 'Admin',
    role: 'admin',
    isBlocked: false,
    isSuperAdmin: true,
    createdAt: new Date().toISOString(),
  };

  localStorage.setItem(
    USERS_STORAGE_KEY,
    JSON.stringify([...users, superAdminUser])
  );

  return superAdminUser;
};