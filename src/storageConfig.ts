export type StorageProvider = "localStorage" | "database";

const rawProvider = import.meta.env.VITE_STORAGE_PROVIDER;

const isValidStorageProvider = (value: unknown): value is StorageProvider => {
  return value === "localStorage" || value === "database";
};

export const STORAGE_PROVIDER: StorageProvider = isValidStorageProvider(rawProvider)
  ? rawProvider
  : "localStorage";

export const isLocalStorageProvider = () => STORAGE_PROVIDER === "localStorage";

export const isDatabaseProvider = () => STORAGE_PROVIDER === "database";