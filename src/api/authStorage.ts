import type { User } from '../models/User';

const LOGGED_USER_ID_STORAGE_KEY = 'manageme-logged-user-id';

export const authStorageApi = {
  getLoggedUserId(): string | null {
    return localStorage.getItem(LOGGED_USER_ID_STORAGE_KEY);
  },

  setLoggedUser(user: User): void {
    localStorage.setItem(LOGGED_USER_ID_STORAGE_KEY, user.id);
  },

  logout(): void {
    localStorage.removeItem(LOGGED_USER_ID_STORAGE_KEY);
  },
};