import type { User } from "../models/User";

const USERS_KEY = "manageme_users";
const LOGGED_USER_KEY = "manageme_logged_user";

const MOCK_USERS: User[] = [
  {
    id: crypto.randomUUID(),
    name: "Admin User",
    email: "admin@manageme.local",
    role: "admin",
  },
  {
    id: crypto.randomUUID(),
    name: "Dev One",
    email: "developer@manageme.local",
    role: "developer",
  },
  {
    id: crypto.randomUUID(),
    name: "Ops One",
    email: "devops@manageme.local",
    role: "devops",
  },
];

function seedUsers() {
  const existingUsers = localStorage.getItem(USERS_KEY);
  const existingLoggedUser = localStorage.getItem(LOGGED_USER_KEY);

  if (!existingUsers) {
    localStorage.setItem(USERS_KEY, JSON.stringify(MOCK_USERS));
  }

  if (!existingLoggedUser) {
    const admin = MOCK_USERS.find((u) => u.role === "admin");
    if (admin) {
      localStorage.setItem(LOGGED_USER_KEY, JSON.stringify(admin));
    }
  }
}

export function getUsers(): User[] {
  seedUsers();
  const data = localStorage.getItem(USERS_KEY);
  return data ? JSON.parse(data) : [];
}

export function getLoggedUser(): User | null {
  seedUsers();
  const data = localStorage.getItem(LOGGED_USER_KEY);
  return data ? JSON.parse(data) : null;
}