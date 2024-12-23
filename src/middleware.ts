import { defineMiddleware } from "astro/middleware";
import { ActionError, getActionContext, type SafeResult, type SerializedActionResult } from "astro:actions";
import { jwtVerify, SignJWT } from "jose";
import { randomUUID } from "node:crypto";

// Include both versions of paths (with and without trailing slash)
const AUTH_REQUIRED_ROUTES = ["/dashboard", "/dashboard/"];
const AUTH_REDIRECT_ROUTES = ["/login", "/login/", "/signup", "/signup/"];
const PUBLIC_ROUTES = ["/", ""];

const JWT_SECRET = new TextEncoder().encode(import.meta.env.JWT_SECRET_KEY);

type AuthResult =
  | { status: "authorized"; payload: any; msg: string }
  | { status: "unauthorized"; msg: string };

const verifyAuthToken = async (token?: string): Promise<AuthResult> => {
  if (!token) return { status: "unauthorized", msg: "Authentication token is missing" };
  try {
    const jwtVerifyResult = await jwtVerify(token, JWT_SECRET);
    return { status: "authorized", payload: jwtVerifyResult.payload, msg: "Token is valid" };
  } catch (error) {
    return { status: "unauthorized", msg: "Invalid or expired authentication token" };
  }
};

export const generateAuthToken = async (payload: any) => {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("24h")
    .sign(JWT_SECRET);
};

// Helper function to normalize paths
const normalizePath = (path: string) => path.replace(/\/$/, "");

export const onRequest = defineMiddleware(async (context, next) => {
  const { action, setActionResult } = getActionContext(context);

  // Handle auth actions (signup/login)
  if (action?.calledFrom === "form" && ["signup", "login", "logout"].includes(action.name)) {
    try {
      const result = await action.handler();
      const referer = context.request.headers.get("Referer");

      // Handle successful auth
      if (result.data && result.data.success) {
        if (action.name === "logout") {
          context.cookies.delete("auth-token");
          context.cookies.delete("session-id");
          context.cookies.delete("return-to");
          return context.redirect("/");
        }
        if (result.data.user) {
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
        }

        const sessionId = randomUUID();
        context.cookies.set("session-id", sessionId, {
          httpOnly: true,
          secure: true,
          sameSite: "lax",
          path: "/",
        });

        return context.redirect(result.data.redirect || "/dashboard");
      }

      // If not successful or there's an error, redirect back to the form
      setActionResult(action.name, transformToSerializedResult(result)); // Set action result
      return context.redirect(referer || `/${action.name}`);
    } catch (error) {
      console.error("Auth action error:", error);
      const referer = context.request.headers.get("Referer");
      return context.redirect(referer || `/${action.name}`);
    }
  }


  // Get current path and normalize it
  const currentPath = context.url.pathname;
  const normalizedPath = normalizePath(currentPath);

  // Check authentication status first
  const token = context.cookies.get("auth-token")?.value;
  const authResult = await verifyAuthToken(token);
  const isAuthenticated = authResult.status === "authorized";

  // If authenticated, check if trying to access auth pages
  if (isAuthenticated) {
    console.log("User is authenticated");
    // Check both normalized and non-normalized paths
    if (AUTH_REDIRECT_ROUTES.includes(currentPath) || AUTH_REDIRECT_ROUTES.includes(normalizedPath)) {
      return context.redirect("/dashboard");
    }
  }

  // Handle public routes
  if (PUBLIC_ROUTES.includes(currentPath) || PUBLIC_ROUTES.includes(normalizedPath)) {
    return next();
  }

  // Handle protected routes
  if (AUTH_REQUIRED_ROUTES.includes(currentPath) || AUTH_REQUIRED_ROUTES.includes(normalizedPath)) {
    if (isAuthenticated) {
      context.locals.user = authResult.payload;
      return next();
    }

    // Clear invalid tokens
    if (token) {
      context.cookies.delete("auth-token");
      context.cookies.delete("session-id");
    }

    // Store the intended URL for post-login redirect
    const returnTo = normalizedPath;
    if (returnTo !== "/login") {
      context.cookies.set("return-to", returnTo, {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        path: "/",
      });
    }

    return context.redirect("/login");
  }

  // For all other routes, continue
  return next();
});

const transformToSerializedResult = (result: SafeResult<any, any>): SerializedActionResult => {
  if (result.data) {
    return {
      type: "data",
      contentType: "application/json+devalue",
      status: 200,
      body: JSON.stringify(result.data),
    };
  } else if (result.error) {
    return {
      type: "error",
      contentType: "application/json",
      status: 400,
      body: JSON.stringify({ error: result.error }),
    };
  } else {
    return {
      type: "empty",
      status: 204,
    };
  }
};
