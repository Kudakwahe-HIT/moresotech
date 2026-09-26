import type { Metadata } from "next";
import { AuthShell } from "../_components/auth-shell";
import { SignInForm } from "./sign-in-form";

export const metadata: Metadata = {
  title: "Sign in | MoreSo Tech",
  description: "Sign in to your MoreSo Tech account.",
};

export default function SignInPage() {
  return (
    <AuthShell
      illustration={{ src: "/illustrations/sign-in.svg", alt: "Person signing in on a large screen" }}
      eyebrow="Learn. Grow. Advance."
      headline="Pick up right where you left off."
      description="Your courses, progress and certificates are waiting. Sign in to keep building the skills that move you forward."
      highlights={[
        "Resume courses on any device",
        "Track progress and earn certificates",
        "Learn from industry practitioners",
      ]}
    >
      <SignInForm />
    </AuthShell>
  );
}
