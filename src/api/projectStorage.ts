import type { Project } from "../models/Project";
import { createManyNotifications } from "./notificationStorage";
import { getUsers } from "./userStorage";

const PROJECTS_KEY = "manageme_projects";

function readProjects(): Project[] {
  const raw = localStorage.getItem(PROJECTS_KEY);

  if (!raw) return [];

  try {
    return JSON.parse(raw) as Project[];
  } catch {
    return [];
  }
}

function writeProjects(projects: Project[]): void {
  localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
}

export function getProjects(): Project[] {
  return readProjects();
}

export function createProject(project: Omit<Project, "id">): Project {
  const newProject: Project = {
    ...project,
    id: crypto.randomUUID(),
  };

  const projects = readProjects();
  projects.push(newProject);
  writeProjects(projects);

  const adminUsers = getUsers().filter((user) => user.role === "admin");

  if (adminUsers.length > 0) {
    createManyNotifications(
      adminUsers.map((admin) => ({
        title: "Utworzono nowy projekt",
        message: `Utworzono nowy projekt: "${newProject.name}".`,
        priority: "high",
        recipientId: admin.id,
      }))
    );
  }

  return newProject;
}

export function updateProject(updatedProject: Project): void {
  const projects = readProjects().map((project) =>
    project.id === updatedProject.id ? updatedProject : project
  );

  writeProjects(projects);
}

export function deleteProject(projectId: string): void {
  const projects = readProjects().filter((project) => project.id !== projectId);
  writeProjects(projects);
}