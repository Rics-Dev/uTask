import { defineAction, ActionError } from 'astro:actions';
import { z } from 'astro:schema';
import { db, Task, User, Project } from 'astro:db';
import { eq } from 'astro:db';

export const addTask = defineAction({
  accept: 'form',
  input: z.object({
    title: z.string().min(1, "Le titre de la tâche est requis"),
    description: z.preprocess(val => val === null ? undefined : val, z.string().optional().default("")),
    priority: z.enum(['low', 'medium', 'high']),
    status: z.enum(['not_started', 'in_progress', 'waiting', 'completed']),
    estimatedHours: z.preprocess(
      (val) => val === '' ? 0 : Number(val),
      z.number().nonnegative()
    ),
    actualHours: z.preprocess(
      (val) => val === '' ? 0 : Number(val),
      z.number().nonnegative()
    ),
    labels: z.preprocess(val => val === null ? undefined : val, z.string().optional().default("")),
    progress: z.preprocess(
      (val) => val === '' ? 0 : Number(val),
      z.number().min(0).max(100)
    ),
    isRecurring: z.preprocess(
      (val) => val === 'on' || val === 'true',
      z.boolean()
    ).optional().default(false),
    recurringPattern: z.string().optional().default(""),
    dueDate: z.string().optional(),
    assignedTo: z.preprocess(
      (val) => Number(val),
      z.number().positive()
    ),
    projectId: z.preprocess(
      (val) => Number(val),
      z.number().positive()
    ),
    createdBy: z.preprocess(
      (val) => Number(val),
      z.number().positive()
    ),
  }),
  handler: async (input, context) => {
    try {
      const authToken = context.cookies.get("auth-token")?.value;
      if (!authToken) {
        throw new ActionError({ code: "UNAUTHORIZED", message: "Vous devez être connecté pour créer une tâche" });
      }

      console.log('Input:', {
        assignedTo: input.assignedTo,
        projectId: input.projectId,
        createdBy: input.createdBy
      });


      // Validate both users and project existence before insertion
      const [assignedUser, project] = await Promise.all([
        db.select().from(User).where(eq(User.id, input.assignedTo)).get(),
        db.select().from(Project).where(eq(Project.id, input.projectId)).get()
      ]);

      console.log('Database checks:', {
        assignedUserExists: !!assignedUser,
        projectExists: !!project
      });


      if (!assignedUser) {
        throw new ActionError({
          code: "BAD_REQUEST",
          message: "L'utilisateur assigné n'existe pas"
        });
      }

      if (!project) {
        throw new ActionError({
          code: "BAD_REQUEST",
          message: "Le projet n'existe pas"
        });
      }

      const processedLabels = input.labels?.split(',').map(label => label.trim()).join(',') ?? '';

      const taskData = {
        title: input.title,
        description: input.description || '',
        priority: input.priority,
        status: input.status,
        projectId: input.projectId,
        createdBy: input.createdBy,
        assignedTo: input.assignedTo,
        createdAt: new Date(),
        dueDate: input.dueDate ? new Date(input.dueDate) : new Date(),
        estimatedHours: Number(input.estimatedHours) || 0,
        actualHours: Number(input.actualHours) || 0,
        labels: processedLabels,
        progress: Number(input.progress) || 0,
        isRecurring: input.isRecurring,
        recurringPattern: input.recurringPattern || ''
      };

      // Log final task data before insertion
      console.log('Task data to insert:', taskData);
      // Validate that all numeric fields are finite numbers
      const numericFields = ['projectId', 'createdBy', 'assignedTo', 'estimatedHours', 'actualHours', 'progress'];
      for (const field of numericFields) {
        if (!Number.isFinite((taskData as any)[field])) {
          throw new ActionError({
            code: "BAD_REQUEST",
            message: `La valeur du champ ${field} n'est pas valide`
          });
        }
      }

      const [newTask] = await db.insert(Task).values(taskData).returning();
      return { success: true, task: newTask };
    } catch (error) {
      if (error instanceof ActionError) {
        throw error;
      }
      throw new ActionError({
        code: "BAD_REQUEST",
        message: "Une erreur est survenue lors de la création de la tâche"
      });
    }
  }
});
