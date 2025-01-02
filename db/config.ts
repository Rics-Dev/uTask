import { defineDb, defineTable, column } from 'astro:db';

// Users table
const User = defineTable({
  columns: {
    id: column.number({ primaryKey: true }),
    email: column.text({ unique: true }),
    passwordHash: column.text(),
    fullName: column.text(),
    createdAt: column.date({ default: new Date() }),
    userType: column.text(), // 'individual', 'business', 'admin'
    isActive: column.boolean({ default: true }),
  }
});

// Organizations table
const Organization = defineTable({
  columns: {
    id: column.number({ primaryKey: true }),
    name: column.text(),
    orgType: column.text(), // 'small', 'medium', 'large'
    createdAt: column.date({ default: new Date() }),
  }
});

// Organization members linking table
const OrganizationMember = defineTable({
  columns: {
    orgId: column.number({ references: () => Organization.columns.id }),
    userId: column.number({ references: () => User.columns.id }),
    role: column.text(), // 'admin', 'member', 'viewer'
    joinedAt: column.date({ default: new Date() }),
  }
});

// Projects table
const Project = defineTable({
  columns: {
    id: column.number({ primaryKey: true }),
    name: column.text(),
    description: column.text(),
    orgId: column.number({ references: () => Organization.columns.id }),
    createdBy: column.number({ references: () => User.columns.id }),
    createdAt: column.date({ default: new Date() }),
    startDate: column.date(),
    endDate: column.date(),
    status: column.text(), // 'planning', 'active', 'on_hold', 'completed', 'cancelled'
  }
});

// Project members linking table
const ProjectMember = defineTable({
  columns: {
    projectId: column.number({ references: () => Project.columns.id }),
    userId: column.number({ references: () => User.columns.id }),
    role: column.text(), // 'project_manager', 'team_member', 'viewer'
    joinedAt: column.date({ default: new Date() }),
  }
});

// Tasks table
const Task = defineTable({
  columns: {
    id: column.number({ primaryKey: true }),
    title: column.text(),
    description: column.text(),
    priority: column.text(), // 'low', 'medium', 'high'
    status: column.text(), // 'not_started', 'in_progress', 'waiting', 'completed'
    projectId: column.number({ references: () => Project.columns.id }),
    createdBy: column.number({ references: () => User.columns.id }),
    assignedTo: column.number({ references: () => User.columns.id }),
    createdAt: column.date({ default: new Date() }),
    dueDate: column.date(),
    estimatedHours: column.number(),
    actualHours: column.number(),
    labels: column.text(), // Pour les étiquettes/catégories
    progress: column.number(), // Pour la barre de progression (0-100)
    isRecurring: column.boolean(), // Pour les tâches récurrentes
    recurringPattern: column.text(), // Pattern de récurrence (daily, weekly, etc.)
  }
});

// Task dependencies
const TaskDependency = defineTable({
  columns: {
    dependentTaskId: column.number({ references: () => Task.columns.id }),
    prerequisiteTaskId: column.number({ references: () => Task.columns.id }),
    createdAt: column.date({ default: new Date() }),
  }
});

// Comments table
const Comment = defineTable({
  columns: {
    id: column.number({ primaryKey: true }),
    taskId: column.number({ references: () => Task.columns.id }),
    userId: column.number({ references: () => User.columns.id }),
    content: column.text(),
    createdAt: column.date({ default: new Date() }),
    updatedAt: column.date({ default: new Date() }),
  }
});

// Notifications table
const Notification = defineTable({
  columns: {
    id: column.number({ primaryKey: true }),
    userId: column.number({ references: () => User.columns.id }),
    title: column.text(),
    content: column.text(),
    type: column.text(), // 'task_assignment', 'due_date', 'mention', 'project_update'
    relatedTaskId: column.number({ references: () => Task.columns.id }),
    relatedProjectId: column.number({ references: () => Project.columns.id }),
    createdAt: column.date({ default: new Date() }),
  }
});


const Calendar = defineTable({
  columns: {
    id: column.number({ primaryKey: true }),
    userId: column.number({ references: () => User.columns.id }),
    eventTitle: column.text(),
    description: column.text(),
    startDate: column.date(),
    endDate: column.date(),
    isRecurring: column.boolean(),
    recurringPattern: column.text(),
    reminderTime: column.date(),
    projectId: column.number({ references: () => Project.columns.id }),
    taskId: column.number({ references: () => Task.columns.id }),
  }
});


export default defineDb({
  tables: {
    User,
    Organization,
    OrganizationMember,
    Project,
    ProjectMember,
    Task,
    TaskDependency,
    Comment,
    Notification,
    Calendar,
  }
});
