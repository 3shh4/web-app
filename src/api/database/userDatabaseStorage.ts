import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  setDoc,
} from 'firebase/firestore';
import { SUPER_ADMIN_EMAIL } from '../../authConfig';
import type { User, UserRole } from '../../models/User';
import { db } from './firebase';

const USERS_COLLECTION = 'users';

interface GoogleUserData {
  email: string;
  firstName: string;
  lastName: string;
}

export class UserDatabaseStorageApi {
  async getUsers(): Promise<User[]> {
    const snapshot = await getDocs(collection(db, USERS_COLLECTION));

    return snapshot.docs.map((document) => document.data() as User);
  }

  async getUserById(userId: string): Promise<User | undefined> {
    const users = await this.getUsers();

    return users.find((user) => user.id === userId);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const users = await this.getUsers();

    return users.find(
      (user) => user.email.toLowerCase() === email.toLowerCase()
    );
  }

  async createOrGetUserFromGoogle(googleUserData: GoogleUserData): Promise<{
    user: User;
    isNewUser: boolean;
  }> {
    const existingUser = await this.getUserByEmail(googleUserData.email);

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

    await setDoc(doc(db, USERS_COLLECTION, newUser.id), newUser);

    return {
      user: newUser,
      isNewUser: true,
    };
  }

  async updateUserRole(
    userId: string,
    role: UserRole
  ): Promise<User | undefined> {
    const user = await this.getUserById(userId);

    if (!user) {
      return undefined;
    }

    if (user.isSuperAdmin) {
      return user;
    }

    const updatedUser: User = {
      ...user,
      role,
    };

    await setDoc(doc(db, USERS_COLLECTION, userId), updatedUser);

    return updatedUser;
  }

  async blockUser(userId: string): Promise<User | undefined> {
    const user = await this.getUserById(userId);

    if (!user) {
      return undefined;
    }

    if (user.isSuperAdmin) {
      return user;
    }

    const updatedUser: User = {
      ...user,
      isBlocked: true,
    };

    await setDoc(doc(db, USERS_COLLECTION, userId), updatedUser);

    return updatedUser;
  }

  async unblockUser(userId: string): Promise<User | undefined> {
    const user = await this.getUserById(userId);

    if (!user) {
      return undefined;
    }

    const updatedUser: User = {
      ...user,
      isBlocked: false,
    };

    await setDoc(doc(db, USERS_COLLECTION, userId), updatedUser);

    return updatedUser;
  }

  async deleteAllUsers(): Promise<void> {
    const snapshot = await getDocs(collection(db, USERS_COLLECTION));

    await Promise.all(
      snapshot.docs.map((document) =>
        deleteDoc(doc(db, USERS_COLLECTION, document.id))
      )
    );
  }
}

export const userDatabaseStorageApi = new UserDatabaseStorageApi();