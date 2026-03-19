const ACTIVE_PROJECT_KEY = 'manageme_active_project_id';

export function getActiveProjectId(): string | null {
  return localStorage.getItem(ACTIVE_PROJECT_KEY);
}

export function setActiveProjectId(projectId: string): void {
  localStorage.setItem(ACTIVE_PROJECT_KEY, projectId);
}

export function clearActiveProjectId(): void {
  localStorage.removeItem(ACTIVE_PROJECT_KEY);
}