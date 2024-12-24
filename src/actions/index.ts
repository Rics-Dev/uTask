// src/actions/index.ts
import { defineAction, ActionError } from 'astro:actions';
import { z } from 'astro:schema';
import bcrypt from 'bcryptjs';
import { db, User, Organization, OrganizationMember } from 'astro:db';
import { eq } from 'astro:db';

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

    handler: async (input) => {
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

        // Create user
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(input.password, salt);

        const [newUser] = await db.insert(User).values({
          email: input.email,
          passwordHash,
          fullName: input.fullName,
          userType: 'business',
          isActive: true,
        }).returning();

        // Create organization
        const [newOrg] = await db.insert(Organization).values({
          name: input.companyName,
          orgType: 'small',
        }).returning();

        // Create organization membership
        await db.insert(OrganizationMember).values({
          orgId: newOrg.id,
          userId: newUser.id,
          role: 'admin',
        });

        // Return success with user data for JWT creation
        return {
          success: true,
          user: newUser,
          redirect: '/dashboard'
        };
      } catch (error) {
        if (error instanceof ActionError) throw error;

        throw new ActionError({
          code: "UNAUTHORIZED",
          message: 'Une erreur est survenue lors de l\'inscription',
        });
      }
    }
  }),

  login: defineAction({
    accept: 'form',
    input: z.object({
      email: z.string().email("Format d'email invalide"),
      password: z.string().min(1, "Le mot de passe est requis"),
    }),

    handler: async (input) => {
      try {
        // Find user
        const user = await db
          .select()
          .from(User)
          .where(eq(User.email, input.email))
          .get();


        if (!user) {
          throw new ActionError({
            code: 'UNAUTHORIZED',
            message: "Utilisateur n'existe pas",
          });
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(input.password, user.passwordHash);
        if (!isValidPassword) {
          throw new ActionError({
            code: 'UNAUTHORIZED',
            message: 'Mot de passe incorrect',
          });
        }


        return {
          success: true,
          user,
          redirect: '/dashboard'
        };
      } catch (error) {
        if (error instanceof ActionError) throw error;

        console.error('Login error:', error);
        throw new ActionError({
          code: "UNAUTHORIZED",
          message: 'Une erreur est survenue lors de la connexion',
        });
      }
    }
  }),

  logout: defineAction({
    accept: 'form',
    handler: async (input, context) => {
      try {
        // Clear cookies
        context.cookies.delete("auth-token");
        context.cookies.delete("session-id");

        // Return success with redirect
        return {
          success: true,
          redirect: "/",
        };
      } catch (error) {
        console.error('Logout error:', error);
        throw new ActionError({
          code: "INTERNAL_SERVER_ERROR",
          message: 'Une erreur est survenue lors de la déconnexion',
        });
      }
    }
  })
};
