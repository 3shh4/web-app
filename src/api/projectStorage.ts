import type { Project } from '../models/Project';

const PROJECTS_KEY = 'manageme_projects';

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

export function createProject(project: Omit<Project, 'id'>): Project {
  const newProject: Project = {
    ...project,
    id: crypto.randomUUID(),
  };

  const projects = readProjects();
  projects.push(newProject);
  writeProjects(projects);

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