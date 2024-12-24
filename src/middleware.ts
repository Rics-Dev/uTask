
import { defineMiddleware } from "astro/middleware";
import { getActionContext } from "astro:actions";
import { jwtVerify, errors, SignJWT } from "jose";
import { randomUUID } from "crypto";

const secret = new TextEncoder().encode(import.meta.env.JWT_SECRET_KEY);

type AuthResult =
  | { status: "authorized"; payload: any; msg: string }
  | { status: "unauthorized"; msg: string };

// Function to generate JWT token
const generateAuthToken = async (payload: any): Promise<string> => {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("2h")
    .sign(secret);
};

// Verify JWT Token
const verifyAuthToken = async (token?: string): Promise<AuthResult> => {
  if (!token) return { status: "unauthorized", msg: "Authentication token is missing" };
  try {
    const jwtVerifyResult = await jwtVerify(token, secret);
    return { status: "authorized", payload: jwtVerifyResult.payload, msg: "Token is valid" };
  } catch (error) {
    return { status: "unauthorized", msg: "Invalid or expired authentication token" };
  }
};

export const onRequest = defineMiddleware(async (context, next) => {
  const publicRoutes = ["/", "/login", "/signup"];
  const protectedRoutes = ["/dashboard"];
  const token = context.cookies.get("auth-token")?.value;



  // Handle login and signup redirects if user is already logged in
  if (["/login", "/signup"].includes(context.url.pathname)) {
    const authResult = await verifyAuthToken(token);

    if (authResult.status === "authorized") {
      // User is already logged in; redirect to dashboard
      return context.redirect("/dashboard");
    }
    const { action } = getActionContext(context);
    const result = await action?.handler();


    if (!result?.error && result?.data.user) {
      const token = await generateAuthToken({
        userId: result.data.user.id,
        email: result.data.user.email,
        fullName: result.data.user.fullName,
      });

      context.cookies.set("auth-token", token, {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        path: "/",
      });

      const sessionId = randomUUID();
      context.cookies.set("session-id", sessionId, {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        path: "/",
      });

      // Redirect to the dashboard or the provided redirect path
      return context.redirect(result.data.redirect || "/dashboard");
    }
    // Handle failure
    return next();
  }





  // Handle authentication for protected routes
  if (protectedRoutes.includes(context.url.pathname)) {
    const { action } = getActionContext(context);
    if (action?.name === "logout") {
      context.cookies.delete("auth-token");
      context.cookies.delete("session-id");
      return context.redirect("/");
    }
    const authResult = await verifyAuthToken(token);

    if (authResult.status === "authorized") {
      context.locals.user = authResult.payload; // Pass user info to locals
      return next();
    }



    // Redirect to login for unauthorized access
    return context.redirect("/login");
  }

  // Allow public routes
  if (publicRoutes.includes(context.url.pathname)) {
    return next();
  }

  // Default behavior for other routes
  return next();
});

