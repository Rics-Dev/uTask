// src/actions/index.ts
import { defineAction, ActionError } from 'astro:actions';
import { z } from 'astro:schema';
import bcrypt from 'bcryptjs';
import { db, User, Organization, OrganizationMember } from 'astro:db';
import { eq } from 'astro:db';
import { randomUUID } from "node:crypto";


export const server = {
  signup: defineAction({
    accept: 'form',
    input: z.object({
      fullName: z.string().min(1, "Le nom complet est requis"),
      email: z.string().email("Format d'email invalide"),
      companyName: z.string().min(1, "Le nom de l'entreprise est requis"),
      password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères"),
      confirmPassword: z.string()
    }).refine(data => data.password === data.confirmPassword, {
      message: "Les mots de passe ne correspondent pas",
      path: ["confirmPassword"]
    }),

    handler: async (input, context) => {
      console.log('Received input:', input);
      try {
        const existingUser = await db
          .select()
          .from(User)
          .where(eq(User.email, input.email))
          .get();

        if (existingUser) {
          throw new ActionError({
            code: 'BAD_REQUEST',
            message: 'Cet email est déjà utilisé',
          });
        }

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(input.password, salt);

        const [newUser] = await db.insert(User).values({
          email: input.email,
          passwordHash,
          fullName: input.fullName,
          userType: 'business',
          isActive: true,
        }).returning();

        const [newOrg] = await db.insert(Organization).values({
          name: input.companyName,
          orgType: 'small',
        }).returning();

        await db.insert(OrganizationMember).values({
          orgId: newOrg.id,
          userId: newUser.id,
          role: 'admin',
        });

        const sessionId = randomUUID();
        context.cookies.set('session-id', sessionId, {
          httpOnly: true,
          secure: true,
          sameSite: 'lax',
          path: '/',
        });
        context.cookies.set('user-name', newUser.fullName);
        context.cookies.set('user-email', newUser.email);

        return {
          success: true,
          redirect: '/dashboard'  // Add this to specify redirect path
        };
      } catch (error) {
        if (error instanceof ActionError) throw error;

        console.error('Signup error:', error);
        throw new ActionError({
          code: "UNAUTHORIZED",
          message: 'Une erreur est survenue lors de l\'inscription',
        });
      }
    }
  })
};