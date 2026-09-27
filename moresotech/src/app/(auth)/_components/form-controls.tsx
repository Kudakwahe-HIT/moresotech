"use client";

import { useId, useState, type ComponentProps, type ReactNode } from "react";
import { ArrowRight, CircleAlert, Eye, EyeOff, LoaderCircle, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type FieldProps = Omit<ComponentProps<"input">, "id"> & {
  label: string;
  icon: LucideIcon;
  error?: string;
  /** Rendered on the right of the label row, e.g. a "Forgot password?" link. */
  labelAside?: ReactNode;
};

const inputClass =
  "peer h-11 w-full rounded-xl short:h-10 border bg-white pl-11 text-[0.95rem] text-slate-900 shadow-[0_1px_2px_rgba(15,23,42,0.04)] outline-none transition placeholder:text-slate-400 focus:ring-4";

export function TextField({ label, icon: Icon, error, labelAside, className, ...props }: FieldProps) {
  const id = useId();
  return (
    <FieldFrame id={id} label={label} error={error} labelAside={labelAside}>
      <Icon aria-hidden className={iconClass(error)} />
      <input
        id={id}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
        className={cn(inputClass, "pr-4", stateClass(error), className)}
        {...props}
      />
    </FieldFrame>
  );
}

export function PasswordField({ label, icon: Icon, error, labelAside, className, ...props }: FieldProps) {
  const id = useId();
  const [visible, setVisible] = useState(false);
  return (
    <FieldFrame id={id} label={label} error={error} labelAside={labelAside}>
      <Icon aria-hidden className={iconClass(error)} />
      <input
        id={id}
        type={visible ? "text" : "password"}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
        className={cn(inputClass, "pr-12", stateClass(error), className)}
        {...props}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? "Hide password" : "Show password"}
        aria-pressed={visible}
        className="absolute right-1.5 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/30"
      >
        {visible ? <EyeOff className="size-[18px]" /> : <Eye className="size-[18px]" />}
      </button>
    </FieldFrame>
  );
}

function FieldFrame({
  id,
  label,
  error,
  labelAside,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  labelAside?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label htmlFor={id} className="text-sm font-semibold text-slate-700">
          {label}
        </label>
        {labelAside}
      </div>
      <div className="group relative">{children}</div>
      {error && (
        <p id={`${id}-error`} className="flex items-center gap-1.5 text-[0.8rem] font-medium text-red-600 animate-in fade-in slide-in-from-top-1">
          <CircleAlert className="size-3.5 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}

const iconClass = (error?: string) =>
  cn(
    "pointer-events-none absolute left-4 top-1/2 z-10 size-[18px] -translate-y-1/2 transition-colors",
    error ? "text-red-400" : "text-slate-400 group-focus-within:text-brand-blue",
  );

const stateClass = (error?: string) =>
  error
    ? "border-red-300 focus:border-red-400 focus:ring-red-500/10"
    : "border-slate-200 hover:border-slate-300 focus:border-brand-blue focus:ring-brand-blue/10";

export function SubmitButton({ loading, children }: { loading: boolean; children: ReactNode }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="group relative flex h-11 w-full short:h-10 items-center justify-center gap-2 overflow-hidden rounded-xl bg-brand-orange px-4 text-[0.95rem] font-semibold text-white shadow-[0_8px_20px_-6px_rgba(245,130,32,0.55)] transition hover:bg-brand-orange-dark hover:shadow-[0_10px_24px_-6px_rgba(245,130,32,0.65)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-orange/25 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-80"
    >
      {loading ? (
        <LoaderCircle className="size-5 animate-spin" />
      ) : (
        <>
          {children}
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
        </>
      )}
    </button>
  );
}

export function SocialButtons({ action }: { action: "Sign in" | "Sign up" }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <SocialButton label={`${action} with Google`} name="Google">
        <GoogleLogo />
      </SocialButton>
      <SocialButton label={`${action} with Microsoft`} name="Microsoft">
        <MicrosoftLogo />
      </SocialButton>
    </div>
  );
}

function SocialButton({ label, name, children }: { label: string; name: string; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      className="flex h-11 items-center justify-center gap-2.5 rounded-xl short:h-10 border border-slate-200 bg-white text-sm font-semibold text-slate-700 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition hover:border-slate-300 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-blue/10 active:scale-[0.99]"
    >
      {children}
      {name}
    </button>
  );
}

export function OrDivider({ label = "or continue with email" }: { label?: string }) {
  return (
    <div className="relative my-5 flex items-center short:my-4">
      <div className="h-px flex-1 bg-slate-200" />
      <span className="px-4 text-xs font-medium uppercase tracking-wider text-slate-400">{label}</span>
      <div className="h-px flex-1 bg-slate-200" />
    </div>
  );
}

function GoogleLogo() {
  return (
    <svg viewBox="0 0 24 24" className="size-[18px]" aria-hidden>
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}

function MicrosoftLogo() {
  return (
    <svg viewBox="0 0 24 24" className="size-[18px]" aria-hidden>
      <path fill="#F25022" d="M2 2h9.5v9.5H2z" />
      <path fill="#7FBA00" d="M12.5 2H22v9.5h-9.5z" />
      <path fill="#00A4EF" d="M2 12.5h9.5V22H2z" />
      <path fill="#FFB900" d="M12.5 12.5H22V22h-9.5z" />
    </svg>
  );
}

export function FormAlert({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <div
      role="alert"
      className="mb-4 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-3.5 py-3 text-sm font-medium text-red-700 animate-in fade-in slide-in-from-top-1"
    >
      <CircleAlert className="mt-px size-4 shrink-0" />
      {message}
    </div>
  );
}
