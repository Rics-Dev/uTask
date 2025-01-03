// src/stores/TaskStore.ts
import { atom, map } from 'nanostores';

export type Task = {
  id: number; // Unique identifier for the task
  title: string; // Title of the task
  description: string; // Detailed description of the task
  status: string; // Current status of the task
  priority: string; // Priority level (e.g., low, medium, high)
  progress: number; // Task progress in percentage (0-100)
  estimatedHours: number; // Estimated hours for completion
  actualHours: number; // Actual hours spent on the task
  labels: string; // Comma-separated labels associated with the task
  isRecurring: boolean; // Indicates if the task is recurring
  recurringPattern: string | null; // Recurrence pattern (if applicable)
  dueDate: Date | null; // Due date of the task
  assignedTo: number; // User ID assigned to the task
  projectId: number; // Project ID associated with the task
  createdAt: Date; // Date the task was created
  createdBy: number; // User ID of the creator
};

// Atom to track the task list
export const tasksStore = map<{ tasks: Task[] }>({ tasks: [] });
export const isNewTaskOpen = atom(false);
// Initialize tasks with a function
export function initializeTasks(initialTasks: Task[]) {
  tasksStore.set({ tasks: initialTasks });
}

// Add a new task
export function addNanoTask(newTask: Task) {
  console.log(newTask);
  const currentTasks = tasksStore.get().tasks;
  tasksStore.set({ tasks: [...currentTasks, newTask] });
  console.log(tasksStore.get().tasks);
}

// Update a specific task by ID
export function updateTask(updatedTask: Task) {
  const tasks = tasksStore.get().tasks.map(task =>
    task.id === updatedTask.id ? updatedTask : task
  );
  tasksStore.set({ tasks });
}

// Remove a task by ID
export function removeTask(taskId: number) {
  const tasks = tasksStore.get().tasks.filter(task => task.id !== taskId);
  tasksStore.set({ tasks });
}
