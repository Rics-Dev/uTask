import { defineAction, ActionError } from 'astro:actions';
import { z } from 'astro:schema';
import bcrypt from 'bcryptjs';
import { db, User, Organization, OrganizationMember } from 'astro:db';
import { eq } from 'astro:db';
import { SignJWT, jwtVerify } from 'jose';
import { randomUUID } from 'crypto';


const secret = new TextEncoder().encode(import.meta.env.JWT_SECRET_KEY);

// Helper functions for token management
const generateAuthToken = async (payload: any): Promise<string> => {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("2h")
    .sign(secret);
};



const verifyAuthToken = async (token?: string): Promise<any> => {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload;
  } catch (error) {
    return null;
  }
};


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

        // Generate authentication token
        const token = await generateAuthToken({
          userId: newUser.id,
          email: newUser.email,
          fullName: newUser.fullName,
        });

        // Set cookies
        context.cookies.set("auth-token", token, {
          httpOnly: true,
          secure: true,
          sameSite: "lax",
          path: "/",
        });

        context.cookies.set("session-id", randomUUID(), {
          httpOnly: true,
          secure: true,
          sameSite: "lax",
          path: "/",
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

    handler: async (input, context) => {
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


        // Generate authentication token
        const token = await generateAuthToken({
          userId: user.id,
          email: user.email,
          fullName: user.fullName,
        });

        // Set cookies
        context.cookies.set("auth-token", token, {
          httpOnly: true,
          secure: true,
          sameSite: "lax",
          path: "/",
        });

        context.cookies.set("session-id", randomUUID(), {
          httpOnly: true,
          secure: true,
          sameSite: "lax",
          path: "/",
        });


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


  verifyAuth: defineAction({
    input: z.object({}),  // explicitly declare empty input schema
    handler: async (input, context) => {
      const token = context.cookies.get("auth-token")?.value;
      const payload = await verifyAuthToken(token);
      return { isAuthenticated: !!payload, user: payload };
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
