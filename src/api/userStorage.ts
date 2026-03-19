import type { User } from '../models/User';

const LOGGED_USER_KEY = 'manageme_logged_user';

const MOCK_USER: User = {
  id: 'u1',
  firstName: 'Kacper',
  lastName: 'Pogorzelski',
};

export function getLoggedUser(): User {
  const raw = localStorage.getItem(LOGGED_USER_KEY);

  if (!raw) {
    localStorage.setItem(LOGGED_USER_KEY, JSON.stringify(MOCK_USER));
    return MOCK_USER;
  }

  try {
    return JSON.parse(raw) as User;
  } catch {
    localStorage.setItem(LOGGED_USER_KEY, JSON.stringify(MOCK_USER));
    return MOCK_USER;
  }
}