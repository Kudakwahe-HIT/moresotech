/**
 * In production Next.js hides the message of errors thrown by server actions. Throw a
 * UserFacingError for problems the user should read ("Every document must be verified…")
 * and wrap the action in runAction, which turns it into `{ error }` for the client.
 * Anything else (bugs, auth failures, redirects) is re-thrown untouched.
 */
export class UserFacingError extends Error {}

export type ActionResult = { error?: string };

export async function runAction(fn: () => Promise<void>): Promise<ActionResult> {
  try {
    await fn();
    return {};
  } catch (error) {
    if (error instanceof UserFacingError) return { error: error.message };
    throw error;
  }
}
