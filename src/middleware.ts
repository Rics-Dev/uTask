// src/middleware.ts
import { defineMiddleware } from 'astro:middleware';
import { getActionContext } from 'astro:actions';
import { randomUUID } from 'node:crypto';

const actionSessionStore = new Map<string, any>();

export const onRequest = defineMiddleware(async (context, next) => {
  const { action, setActionResult, serializeActionResult } = getActionContext(context);

  const sessionId = context.cookies.get("action-session-id")?.value;

  if (sessionId && actionSessionStore.has(sessionId)) {
    const session = actionSessionStore.get(sessionId);
    setActionResult(session.actionName, session.actionResult);
    actionSessionStore.delete(sessionId);
    context.cookies.delete("action-session-id");
    return next();
  }

  if (action?.calledFrom === "form") {
    const actionResult = await action.handler();

    // Handle successful signup redirect
    if (actionResult.data?.success && actionResult.data?.redirect) {
      return context.redirect(actionResult.data.redirect);
    }

    // Handle errors by redirecting back to the form
    if (actionResult.error) {
      const newSessionId = randomUUID();
      actionSessionStore.set(newSessionId, {
        actionName: action.name,
        actionResult: serializeActionResult(actionResult),
      });

      context.cookies.set("action-session-id", newSessionId, {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        path: "/",
      });

      return context.redirect(context.originPathname);
    }
  }

  return next();
});
