// src/stores/projectstore.ts
import { atom, map } from 'nanostores';

export type Project = {
  id: number;
  name: string;
  description: string;
  orgId: number;
  createdBy: number;
  createdAt: Date;
  startDate: Date;
  endDate: Date;
  status: string;
};

export const projectsStore = map<{ projects: Project[] }>({ projects: [] });
export const isNewProjectOpen = atom(false);
export function initializeProjects(initialprojects: Project[]) {
  projectsStore.set({ projects: initialprojects });
}

// Add a new task
export function addNanoProject(newProject: Project) {
  const currentprojects = projectsStore.get().projects;
  projectsStore.set({ projects: [...currentprojects, newProject] });
}

// Update a specific task by ID
export function updateProject(updatedTask: Project) {
  const projects = projectsStore.get().projects.map(task =>
    task.id === updatedTask.id ? updatedTask : task
  );
  projectsStore.set({ projects });
}

// Remove a task by ID
export function removeProject(projectId: number) {
  const projects = projectsStore.get().projects.filter(project => project.id !== projectId);
  projectsStore.set({ projects });
}
