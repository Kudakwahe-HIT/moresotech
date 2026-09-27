import { isClerkAPIResponseError } from "@clerk/nextjs/errors";

/** The only social providers we offer. They must also be enabled in the Clerk dashboard. */
export const SOCIAL_STRATEGIES = {
  google: "oauth_google",
  microsoft: "oauth_microsoft",
  linkedin: "oauth_linkedin_oidc",
} as const;

export type SocialStrategy = (typeof SOCIAL_STRATEGIES)[keyof typeof SOCIAL_STRATEGIES];

/** Where Clerk sends the browser back to after Google / Microsoft / LinkedIn. */
export const SSO_CALLBACK_URL = "/sso-callback";
/** Where a user lands once signed in; the sign-in page shows the welcome modal for `?welcome=1`. */
export const AFTER_AUTH_URL = "/sign-in?welcome=1";

// Clerk reports which input an error belongs to via `meta.paramName`.
const PARAM_TO_FIELD: Record<string, string> = {
  identifier: "email",
  email_address: "email",
  password: "password",
  code: "code",
  first_name: "firstName",
  last_name: "lastName",
};

/** Turns a Clerk error into a message, plus the form field it belongs to when Clerk says so. */
export function describeClerkError(error: unknown): { field?: string; message: string } {
  if (isClerkAPIResponseError(error)) {
    const first = error.errors[0];
    const field = first?.meta?.paramName ? PARAM_TO_FIELD[first.meta.paramName] : undefined;
    return { field, message: first?.longMessage ?? first?.message ?? error.message };
  }
  if (error instanceof Error && error.message) return { message: error.message };
  return { message: "Something went wrong. Please try again." };
}
