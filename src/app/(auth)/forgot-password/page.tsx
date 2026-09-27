import type { Metadata } from "next";
import { AuthShell } from "../_components/auth-shell";
import { ForgotPasswordForm } from "./forgot-password-form";

export const metadata: Metadata = {
  title: "Reset password | MoreSo Tech",
  description: "Reset the password for your MoreSo Tech account.",
};

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      illustration={{ src: "/illustrations/sign-in.svg", alt: "Person recovering access to their account" }}
      eyebrow="Account recovery"
      headline="Back to learning in a few clicks."
      description="It happens to everyone. We'll email you a one-time code so you can set a new password and pick up where you left off."
      highlights={[
        "Secure, single-use reset code",
        "Codes expire automatically for your safety",
        "Your progress and certificates stay intact",
      ]}
    >
      <ForgotPasswordForm />
    </AuthShell>
  );
}
