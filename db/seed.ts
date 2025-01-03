import { db, User, Organization, OrganizationMember, Project, ProjectMember, Task, Comment, Notification } from 'astro:db';

export default async function () {
  // // Create test users
  // await db.insert(User).values([
  //   {
  //     id: 1,
  //     email: 'john.doe@example.com',
  //     passwordHash: 'hashed_password_1',
  //     fullName: 'John',
  //     userType: 'business',
  //     isActive: true,
  //   },
  //   {
  //     id: 2,
  //     email: 'jane.smith@example.com',
  //     passwordHash: 'hashed_password_2',
  //     fullName: 'John',
  //     userType: 'business',
  //     isActive: true,
  //   },
  //   {
  //     id: 3,
  //     email: 'bob.wilson@example.com',
  //     passwordHash: 'hashed_password_3',
  //     fullName: 'John',
  //     userType: 'individual',
  //     isActive: true,
  //   }
  // ]);
  //
  // // Create test organization
  // await db.insert(Organization).values([
  //   {
  //     id: 1,
  //     name: 'Tech Corp',
  //     orgType: 'medium',
  //   }
  // ]);
  //
  // // Link users to organization
  // await db.insert(OrganizationMember).values([
  //   {
  //     orgId: 1,
  //     userId: 1,
  //     role: 'admin',
  //   },
  //   {
  //     orgId: 1,
  //     userId: 2,
  //     role: 'member',
  //   }
  // ]);
  //
  // // Create test projects
  // await db.insert(Project).values([
  //   {
  //     id: 1,
  //     name: 'Website Redesign',
  //     description: 'Redesigning the company website',
  //     orgId: 1,
  //     createdBy: 1,
  //     status: 'active',
  //     startDate: new Date('2024-01-01'),
  //     endDate: new Date('2024-03-31'),
  //   },
  //   {
  //     id: 2,
  //     name: 'Mobile App Development',
  //     description: 'Building a new mobile application',
  //     orgId: 1,
  //     createdBy: 1,
  //     status: 'planning',
  //     startDate: new Date('2024-02-01'),
  //     endDate: new Date('2024-06-30'),
  //   }
  // ]);
  //
  // // Assign users to projects
  // await db.insert(ProjectMember).values([
  //   {
  //     projectId: 1,
  //     userId: 1,
  //     role: 'project_manager',
  //   },
  //   {
  //     projectId: 1,
  //     userId: 2,
  //     role: 'team_member',
  //   },
  //   {
  //     projectId: 2,
  //     userId: 1,
  //     role: 'project_manager',
  //   },
  //   {
  //     projectId: 2,
  //     userId: 2,
  //     role: 'team_member',
  //   }
  // ]);
  //
  // // Create test tasks
  // await db.insert(Task).values([
  //   {
  //     id: 1,
  //     title: 'Design Homepage Mockup',
  //     description: 'Create initial mockups for the new homepage',
  //     projectId: 1,
  //     createdBy: 1,
  //     assignedTo: 2,
  //     priority: 'high',
  //     status: 'in_progress',
  //     estimatedHours: 20,
  //     actualHours: 0,
  //     dueDate: new Date('2024-01-15'),
  //     labels: 'text',
  //     progress: 0,
  //     isRecurring: false,
  //     recurringPattern: 'daily',
  //   },
  //   {
  //     id: 2,
  //     title: 'Backend API Setup',
  //     description: 'Set up initial REST API endpoints',
  //     projectId: 2,
  //     createdBy: 1,
  //     assignedTo: 2,
  //     priority: 'medium',
  //     status: 'not_started',
  //     estimatedHours: 40,
  //     actualHours: 0,
  //     dueDate: new Date('2024-02-15'),
  //     labels: 'text',
  //     progress: 0,
  //     isRecurring: false,
  //     recurringPattern: 'daily',
  //   }
  // ]);
  //
  // // Create test comments
  // await db.insert(Comment).values([
  //   {
  //     id: 1,
  //     taskId: 1,
  //     userId: 1,
  //     content: 'Let\'s focus on mobile-first design',
  //     createdAt: new Date(),
  //   },
  //   {
  //     id: 2,
  //     taskId: 1,
  //     userId: 2,
  //     content: 'I\'ll have the first draft ready by tomorrow',
  //     createdAt: new Date(),
  //   }
  // ]);
  //
  // // Create test notifications
  // await db.insert(Notification).values([
  //   {
  //     id: 1,
  //     userId: 2,
  //     title: 'New Task Assignment',
  //     content: 'You have been assigned to "Design Homepage Mockup"',
  //     type: 'task_assignment',
  //     relatedTaskId: 1,
  //     relatedProjectId: 1,
  //   }
  // ]);
}
