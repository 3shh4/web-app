import type { Task } from "../models/Task";
import type { Story } from "../models/Story";
import { getStories, updateStoryStatus } from "./storyStorage";

const TASKS_KEY = "manageme_tasks";

export function getTasks(): Task[] {
  const data = localStorage.getItem(TASKS_KEY);
  return data ? JSON.parse(data) : [];
}

export function saveTasks(tasks: Task[]): void {
  localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
}

export function createTask(
  task: Omit<Task, "id" | "createdAt" | "status" | "workedHours">
): Task {
  const tasks = getTasks();

  const newTask: Task = {
    ...task,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    status: "todo",
    workedHours: 0,
  };

  const updated = [...tasks, newTask];
  saveTasks(updated);

  return newTask;
}

export function updateTask(updatedTask: Task): void {
  const tasks = getTasks();
  const updated = tasks.map((task) =>
    task.id === updatedTask.id ? updatedTask : task
  );

  saveTasks(updated);
  syncStoryStatus(updatedTask.storyId, updated);
}

export function deleteTask(taskId: string): void {
  const tasks = getTasks();
  const taskToDelete = tasks.find((task) => task.id === taskId);
  const updated = tasks.filter((task) => task.id !== taskId);

  saveTasks(updated);

  if (taskToDelete) {
    syncStoryStatus(taskToDelete.storyId, updated);
  }
}

export function assignTask(taskId: string, userId: string): void {
  const tasks = getTasks();

  const updated = tasks.map((task) => {
    if (task.id !== taskId) return task;

    return {
      ...task,
      assignedUserId: userId,
      status: "doing" as const,
      startedAt: task.startedAt ?? new Date().toISOString(),
    };
  });

  const assignedTask = updated.find((task) => task.id === taskId);
  saveTasks(updated);

  if (assignedTask) {
    const story = getStories().find((s: Story) => s.id === assignedTask.storyId);

    if (story && story.status === "todo") {
      updateStoryStatus(story.id, "doing");
    }
  }
}

export function markTaskDone(taskId: string): void {
  const tasks = getTasks();

  const updated = tasks.map((task) => {
    if (task.id !== taskId) return task;

    return {
      ...task,
      status: "done" as const,
      finishedAt: new Date().toISOString(),
      startedAt: task.startedAt ?? new Date().toISOString(),
    };
  });

  saveTasks(updated);

  const doneTask = updated.find((task) => task.id === taskId);

  if (doneTask) {
    syncStoryStatus(doneTask.storyId, updated);
  }
}

function syncStoryStatus(storyId: string, tasks: Task[]): void {
  const storyTasks = tasks.filter((task) => task.storyId === storyId);

  if (storyTasks.length === 0) {
    updateStoryStatus(storyId, "todo");
    return;
  }

  const allDone = storyTasks.every((task) => task.status === "done");
  const anyDoing = storyTasks.some((task) => task.status === "doing");

  if (allDone) {
    updateStoryStatus(storyId, "done");
    return;
  }

  if (anyDoing) {
    updateStoryStatus(storyId, "doing");
    return;
  }

  updateStoryStatus(storyId, "todo");
}