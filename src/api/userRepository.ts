import { isDatabaseProvider } from '../storageConfig';
import type { User, UserRole } from '../models/User';
import { userDatabaseStorageApi } from './database/userDatabaseStorage';
import { userStorageApi } from './userStorage';

interface GoogleUserData {
  email: string;
  firstName: string;
  lastName: string;
}

class UserRepository {
  async getUsers(): Promise<User[]> {
    if (isDatabaseProvider()) {
      return userDatabaseStorageApi.getUsers();
    }

    return userStorageApi.getUsers();
  }

  async getUserById(userId: string): Promise<User | undefined> {
    if (isDatabaseProvider()) {
      return userDatabaseStorageApi.getUserById(userId);
    }

    return userStorageApi.getUserById(userId);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    if (isDatabaseProvider()) {
      return userDatabaseStorageApi.getUserByEmail(email);
    }

    return userStorageApi.getUserByEmail(email);
  }

  async createOrGetUserFromGoogle(googleUserData: GoogleUserData): Promise<{
    user: User;
    isNewUser: boolean;
  }> {
    if (isDatabaseProvider()) {
      return userDatabaseStorageApi.createOrGetUserFromGoogle(googleUserData);
    }

    return userStorageApi.createOrGetUserFromGoogle(googleUserData);
  }

  async updateUserRole(
    userId: string,
    role: UserRole
  ): Promise<User | undefined> {
    if (isDatabaseProvider()) {
      return userDatabaseStorageApi.updateUserRole(userId, role);
    }

    return userStorageApi.updateUserRole(userId, role);
  }

  async blockUser(userId: string): Promise<User | undefined> {
    if (isDatabaseProvider()) {
      return userDatabaseStorageApi.blockUser(userId);
    }

    return userStorageApi.blockUser(userId);
  }

  async unblockUser(userId: string): Promise<User | undefined> {
    if (isDatabaseProvider()) {
      return userDatabaseStorageApi.unblockUser(userId);
    }

    return userStorageApi.unblockUser(userId);
  }

  async deleteAllUsers(): Promise<void> {
    if (isDatabaseProvider()) {
      return userDatabaseStorageApi.deleteAllUsers();
    }

    return userStorageApi.deleteAllUsers();
  }
}

export const userRepository = new UserRepository();