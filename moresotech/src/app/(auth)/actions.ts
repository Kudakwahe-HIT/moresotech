"use server";

import bcrypt from "bcryptjs";
import { sql } from "@/lib/db";

export type AuthState =
  | { status: "idle" }
  | { status: "error"; message?: string; fieldErrors?: Record<string, string> }
  | { status: "success"; user: { firstName: string; lastName: string; email: string } };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const BCRYPT_COST = 12;
// Compared against when no user matches, so a missing account takes as long as a wrong password.
const DUMMY_HASH = "$2b$12$szoS0PhZqvKMUNNwwjSDlOZW3z4Rk18p2zRU5VMttPJKeGhskwCkq";

type UserRow = { first_name: string; last_name: string; email: string; password_hash: string };

export async function signIn(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!EMAIL_RE.test(email) || !password) {
    return { status: "error", message: "Enter your email and password." };
  }

  try {
    const [user] = (await sql`
      select first_name, last_name, email, password_hash
      from users
      where lower(email) = lower(${email})
      limit 1
    `) as UserRow[];

    const valid = await bcrypt.compare(password, user?.password_hash ?? DUMMY_HASH);
    if (!user || !valid) {
      return { status: "error", message: "Incorrect email or password." };
    }

    return {
      status: "success",
      user: { firstName: user.first_name, lastName: user.last_name, email: user.email },
    };
  } catch (error) {
    console.error("signIn failed", error);
    return { status: "error", message: "We couldn't sign you in right now. Please try again." };
  }
}

export async function signUp(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const firstName = String(formData.get("firstName") ?? "").trim();
  const lastName = String(formData.get("lastName") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  const fieldErrors: Record<string, string> = {};
  if (!firstName) fieldErrors.firstName = "Required.";
  if (!lastName) fieldErrors.lastName = "Required.";
  if (!EMAIL_RE.test(email)) fieldErrors.email = "Enter a valid email address.";
  if (password.length < 8) fieldErrors.password = "Use at least 8 characters.";
  if (!formData.get("terms")) fieldErrors.terms = "Please accept the terms to continue.";
  if (Object.keys(fieldErrors).length) return { status: "error", fieldErrors };

  try {
    const passwordHash = await bcrypt.hash(password, BCRYPT_COST);
    await sql`
      insert into users (first_name, last_name, email, password_hash)
      values (${firstName}, ${lastName}, ${email}, ${passwordHash})
    `;
    return { status: "success", user: { firstName, lastName, email } };
  } catch (error) {
    if ((error as { code?: string }).code === "23505") {
      return { status: "error", fieldErrors: { email: "An account with this email already exists." } };
    }
    console.error("signUp failed", error);
    return { status: "error", message: "We couldn't create your account right now. Please try again." };
  }
}
