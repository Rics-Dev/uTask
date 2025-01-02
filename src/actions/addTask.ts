import { defineAction, ActionError } from 'astro:actions';
import { z } from 'astro:schema';
import { db, Task, User, Project } from 'astro:db';
import { eq } from 'astro:db';

export const addTask = defineAction({
  accept: 'form',
  input: z.object({
    title: z.string().min(1, "Le titre de la tâche est requis"),
    description: z.preprocess(val => val === null ? undefined : val, z.string().optional().default("")),
    priority: z.enum(['low', 'medium', 'high'], { errorMap: () => ({ message: "La priorité doit être basse, moyenne ou haute" }) }),
    status: z.enum(['not_started', 'in_progress', 'waiting', 'completed'], { errorMap: () => ({ message: "Le statut doit être non commencé, en cours, en attente ou terminé" }) }),
    estimatedHours: z.coerce.number().nonnegative("Les heures estimées doivent être un nombre positif"),
    actualHours: z.coerce.number().nonnegative("Les heures réelles doivent être un nombre positif"),
    labels: z.preprocess(val => val === null ? undefined : val, z.string().optional().default("")),
    progress: z.coerce.number().min(0, "La progression doit être au moins de 0").max(100, "La progression ne peut pas dépasser 100"),
    isRecurring: z.preprocess(
      (val) => val === 'on',
      z.boolean()
    ).optional().default(false),
    recurringPattern: z.string().optional().default(""), // Assuming recurring pattern is optional
    dueDate: z.string().optional(), // Provide default validation or leave as optional
    assignedTo: z.coerce.number().positive("Un utilisateur assigné est requis"),
    projectId: z.coerce.number().positive("Un projet valide est requis"),
  }).refine(data => data.isRecurring ? !!data.recurringPattern : true, {
    message: "Un pattern de récurrence est requis pour les tâches récurrentes",
    path: ["recurringPattern"]
  }),
  handler: async (input, context) => {
    try {
      const authToken = context.cookies.get("auth-token")?.value;
      if (!authToken) {
        throw new ActionError({ code: "UNAUTHORIZED", message: "Vous devez être connecté pour créer une tâche" });
      }


      const [assignedUser, project] = await Promise.all([
        db.select().from(User).where(eq(User.id, input.assignedTo)).get(),
        db.select().from(Project).where(eq(Project.id, input.projectId)).get()
      ]);

      if (!assignedUser || !project) {
        throw new ActionError({ code: "UNAUTHORIZED", message: "Utilisateur ou projet invalide" });
      }

      const processedLabels = input.labels?.split(',').map(label => label.trim()).join(',') ?? '';


      const [newTask] = await db.insert(Task).values({
        title: input.title,
        description: input.description ? input.description : '',
        priority: input.priority,
        status: input.status,
        projectId: input.projectId,
        createdBy: Number(context.locals.user?.userId),
        assignedTo: input.assignedTo,
        createdAt: new Date(),
        dueDate: input.dueDate ? new Date(input.dueDate) : new Date(),
        estimatedHours: input.estimatedHours,
        actualHours: input.actualHours,
        labels: processedLabels ? processedLabels : '',
        progress: input.progress,
        isRecurring: input.isRecurring,
        recurringPattern: input.recurringPattern
      }).returning();





      return { success: true, task: newTask };
    } catch (error) {
      console.error('Add task error:', error);
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
