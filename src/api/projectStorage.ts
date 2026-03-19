import type { Project } from "../models/Project";

const STORAGE_KEY = "manageme_projects";

export class ProjectStorageApi {
  static getAll(): Project[] {
    const data = localStorage.getItem(STORAGE_KEY);

    if (!data) {
      return [];
    }

    try {
      return JSON.parse(data) as Project[];
    } catch (error) {
      console.error("Błąd odczytu projectów z localStorage:", error);
      return [];
    }
  }

  static saveAll(projects: Project[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  }

  static create(project: Omit<Project, "id">): Project {
    const projects = this.getAll();

    const newProject: Project = {
      id: crypto.randomUUID(),
      nazwa: project.nazwa,
      opis: project.opis,
    };

    const updatedProjects = [...projects, newProject];
    this.saveAll(updatedProjects);

    return newProject;
  }

  static update(updatedProject: Project): Project | null {
    const projects = this.getAll();

    const index = projects.findIndex((p) => p.id === updatedProject.id);

    if (index === -1) {
      return null;
    }

    projects[index] = updatedProject;
    this.saveAll(projects);

    return updatedProject;
  }

  static delete(id: string): boolean {
    const projects = this.getAll();
    const filteredProjects = projects.filter((p) => p.id !== id);

    if (filteredProjects.length === projects.length) {
      return false;
    }

    this.saveAll(filteredProjects);
    return true;
  }

  static getById(id: string): Project | null {
    const projects = this.getAll();
    return projects.find((p) => p.id === id) ?? null;
  }
}