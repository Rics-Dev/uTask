import { defineAction, ActionError } from 'astro:actions';
import { z } from 'astro:schema';
import { db, Project, ProjectMember } from 'astro:db';
import { eq } from 'astro:db';

export const addProject = defineAction({
  accept: 'form',
  input: z.object({
    title: z.string().min(1, "Le titre du projet est requis"),
    description: z.preprocess(val => val === null ? undefined : val, z.string().optional().default("")),
    startDate: z.string().min(1, "La date de début est requise"),
    endDate: z.string().min(1, "La date de fin est requise"),
    projectManager: z.preprocess((val) => {
      const coercedVal = Number(val);
      return Number.isNaN(coercedVal) ? undefined : coercedVal;
    }, z.number().positive("Un responsable de projet est requis")),
    members: z.array(z.coerce.number()).optional().default([]),
    status: z.enum(['planning', 'active', 'on_hold', 'completed', 'cancelled'], {
      errorMap: () => ({ message: "Le statut doit être en planification, actif, en attente, terminé ou annulé" })
    }).default('planning'),
    priority: z.enum(['low', 'medium', 'high'], {
      errorMap: () => ({ message: "La priorité doit être basse, moyenne ou haute" })
    }).default('medium'),
    orgId: z.preprocess(
      (val) => Number(val),
      z.number().positive()
    ),
    createdBy: z.preprocess(
      (val) => Number(val),
      z.number().positive()
    ),

  }).refine(
    data => new Date(data.startDate) <= new Date(data.endDate),
    {
      message: "La date de fin doit être postérieure à la date de début",
      path: ["endDate"]
    }
  ),
  handler: async (input, context) => {
    try {
      const authToken = context.cookies.get("auth-token")?.value;
      if (!authToken) {
        throw new ActionError({ code: "UNAUTHORIZED", message: "Vous devez être connecté pour créer un projet" });
      }

      // Get the organization ID from the user's context
      const orgId = input.orgId;
      if (!orgId) {
        throw new ActionError({ code: "UNAUTHORIZED", message: "Aucune organisation trouvée" });
      }

      // Validate that all numeric fields are finite numbers
      // const numericFields = ['projectManager'];
      // for (const field of numericFields) {
      //   if (!Number.isFinite(field)) {
      //     throw new ActionError({
      //       code: "BAD_REQUEST",
      //       message: `La valeur du champ ${field} n'est pas valide`
      //     });
      //   }
      // }

      // Create the project
      const [newProject] = await db.insert(Project).values({
        name: input.title,
        description: input.description || '',
        orgId: orgId,
        createdBy: input.createdBy,
        createdAt: new Date(),
        startDate: new Date(input.startDate),
        endDate: new Date(input.endDate),
        status: input.status
      }).returning();

      // Add project members including the project manager
      const memberEntries = [
        // Add project manager with project_manager role
        {
          projectId: newProject.id,
          userId: input.projectManager,
          role: 'project_manager',
          joinedAt: new Date()
        },
        // Add other members with team_member role
        ...(input.members || []).map(memberId => ({
          projectId: newProject.id,
          userId: memberId,
          role: 'team_member',
          joinedAt: new Date()
        }))
      ];

      // Filter out duplicate members (in case project manager is also in members array)
      const uniqueMembers = memberEntries.filter((member, index, self) =>
        index === self.findIndex(m => m.userId === member.userId)
      );

      await db.insert(ProjectMember).values(uniqueMembers);

      return { success: true, project: newProject };
    } catch (error) {
      console.error('Add project error:', error);
      if (error instanceof ActionError) {
        throw error;
      }
      throw new ActionError({
        code: "BAD_REQUEST",
        message: "Une erreur est survenue lors de la création du projet"
      });
    }
  }
});

