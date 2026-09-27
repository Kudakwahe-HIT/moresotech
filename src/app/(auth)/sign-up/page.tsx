import type { Metadata } from "next";
import { AuthShell } from "../_components/auth-shell";
import { SignUpForm } from "./sign-up-form";

export const metadata: Metadata = {
  title: "Create account | MoreSo Tech",
  description: "Create your free MoreSo Tech account and start learning.",
};

export default function SignUpPage() {
  return (
    <AuthShell
      illustration={{ src: "/illustrations/sign-up.svg", alt: "Person creating a new account" }}
      eyebrow="Start your journey"
      headline="Uplift, equip and become."
      description="Join a community of learners building real-world digital skills through innovative, hands-on learning."
      highlights={[
        "Free to start, no card required",
        "Personalised learning paths",
        "Certificates you can share",
      ]}
    >
      <SignUpForm />
    </AuthShell>
  );
}
