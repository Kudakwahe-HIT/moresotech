-- App-owned users table. (The neon_auth schema is managed by Neon Auth and is left untouched.)
CREATE TABLE IF NOT EXISTS public.users (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name    text        NOT NULL,
  last_name     text        NOT NULL,
  email         text        NOT NULL,
  password_hash text        NOT NULL,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

-- Emails are unique regardless of case.
CREATE UNIQUE INDEX IF NOT EXISTS users_email_lower_key ON public.users (lower(email));
