import type { Notification } from "../models/Notification";

const STORAGE_KEY = "manageme-notifications";

type CreateNotificationInput = {
  title: string;
  message: string;
  priority: Notification["priority"];
  recipientId: string;
  date?: string;
  isRead?: boolean;
};

function generateId() {
  return `notification-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function sortByDateDesc(items: Notification[]) {
  return [...items].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

export function getNotifications(): Notification[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw) as Notification[];
    return sortByDateDesc(parsed);
  } catch {
    return [];
  }
}

export function saveNotifications(notifications: Notification[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sortByDateDesc(notifications)));
}

export function getNotificationsByRecipient(recipientId: string): Notification[] {
  return getNotifications().filter((notification) => notification.recipientId === recipientId);
}

export function getNotificationById(id: string): Notification | undefined {
  return getNotifications().find((notification) => notification.id === id);
}

export function getUnreadCount(recipientId: string): number {
  return getNotificationsByRecipient(recipientId).filter((item) => !item.isRead).length;
}

export function createNotification(input: CreateNotificationInput): Notification {
  const notifications = getNotifications();

  const notification: Notification = {
    id: generateId(),
    title: input.title,
    message: input.message,
    date: input.date ?? new Date().toISOString(),
    priority: input.priority,
    isRead: input.isRead ?? false,
    recipientId: input.recipientId,
  };

  saveNotifications([notification, ...notifications]);
  return notification;
}

export function createManyNotifications(inputs: CreateNotificationInput[]): Notification[] {
  const notifications = getNotifications();

  const created = inputs.map((input) => ({
    id: generateId(),
    title: input.title,
    message: input.message,
    date: input.date ?? new Date().toISOString(),
    priority: input.priority,
    isRead: input.isRead ?? false,
    recipientId: input.recipientId,
  }));

  saveNotifications([...created, ...notifications]);
  return created;
}

export function markAsRead(id: string) {
  const notifications = getNotifications().map((notification) =>
    notification.id === id
      ? { ...notification, isRead: true }
      : notification
  );

  saveNotifications(notifications);
}

export function markAllAsRead(recipientId: string) {
  const notifications = getNotifications().map((notification) =>
    notification.recipientId === recipientId
      ? { ...notification, isRead: true }
      : notification
  );

  saveNotifications(notifications);
}

export function deleteNotification(id: string) {
  const notifications = getNotifications().filter(
    (notification) => notification.id !== id
  );

  saveNotifications(notifications);
}