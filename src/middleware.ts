// middleware.ts
import { defineMiddleware } from "astro/middleware";
import { actions } from 'astro:actions';

// const publicRoutes = ["/", "/login", "/signup"];
const protectedRoutes = ["/dashboard"];

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname } = context.url;

  // Handle authentication check for protected routes
  if (protectedRoutes.includes(pathname)) {
    const authResult = await context.callAction(actions.verifyAuth, {});

    if (!authResult?.data?.isAuthenticated) {
      return context.redirect("/login");
    }

    // Pass user info to locals
    context.locals.user = authResult.data.user;
  }

  // Handle redirects for logged-in users accessing auth pages
  if (["/login", "/signup"].includes(pathname)) {
    const authResult = await context.callAction(actions.verifyAuth, {});

    if (authResult?.data?.isAuthenticated) {
      return context.redirect("/dashboard");
    }
  }

  return next();
});
