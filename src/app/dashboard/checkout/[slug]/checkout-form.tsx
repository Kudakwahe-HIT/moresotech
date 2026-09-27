"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition, type FormEvent } from "react";
import { CircleAlert, CreditCard, ExternalLink, LoaderCircle, Lock, Smartphone, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";
import { startCoursePayment } from "../actions";

export type CheckoutMethod = {
  code: string;
  name: string;
  description: string | null;
  redirect: boolean;
  fields: { name: string; label: string; type: string; optional: boolean }[];
};

/** Visual identity for well-known Zimbabwean methods; anything else gets a neutral wallet. */
function methodLook(name: string, redirect: boolean) {
  const n = name.toLowerCase();
  if (n.includes("ecocash")) return { icon: Smartphone, tone: "bg-[#e11b22]/10 text-[#c8161d]" };
  if (n.includes("innbucks")) return { icon: Wallet, tone: "bg-[#f9a01b]/15 text-[#b8700a]" };
  if (n.includes("onemoney") || n.includes("one money")) return { icon: Smartphone, tone: "bg-[#ef7d00]/10 text-[#c26400]" };
  if (n.includes("visa") || n.includes("master") || n.includes("card") || n.includes("zimswitch")) return { icon: CreditCard, tone: "bg-brand-blue/10 text-brand-blue" };
  return { icon: redirect ? CreditCard : Wallet, tone: "bg-slate-100 text-slate-600" };
}

export function CheckoutForm({ courseId, methods, amountLabel, email }: { courseId: string; methods: CheckoutMethod[]; amountLabel: string; email: string }) {
  const router = useRouter();
  const [selected, setSelected] = useState(methods[0]?.code ?? "");
  const [values, setValues] = useState<Record<string, string>>({});
  const [error, setError] = useState<string>();
  const [pending, startTransition] = useTransition();
  const method = methods.find((m) => m.code === selected);

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!method) return;
    setError(undefined);
    startTransition(async () => {
      const result = await startCoursePayment({ courseId, methodCode: method.code, fields: values });
      if ("error" in result) return setError(result.error);
      if (result.redirectUrl) window.location.assign(result.redirectUrl);
      else router.push(`/dashboard/payments/${result.paymentId}`);
    });
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-6">
      <section className="rounded-3xl bg-white p-6 shadow-[0_1px_3px_rgba(15,23,42,0.04)] sm:p-7">
        <h2 className="text-lg font-bold text-slate-900">1. Choose how to pay</h2>
        <fieldset className="mt-4">
          <legend className="sr-only">Payment method</legend>
          <div className="grid gap-3 sm:grid-cols-2">
            {methods.map((m) => {
              const look = methodLook(m.name, m.redirect);
              return (
                <label
                  key={m.code}
                  className={cn(
                    "relative flex cursor-pointer items-center gap-3 rounded-2xl border-2 p-4 transition",
                    selected === m.code ? "border-brand-orange bg-brand-orange/[0.04] shadow-[0_8px_24px_-12px_rgba(245,130,32,0.5)]" : "border-slate-200 hover:border-slate-300",
                  )}
                >
                  <input type="radio" name="method" value={m.code} checked={selected === m.code} onChange={() => setSelected(m.code)} className="sr-only" />
                  <span className={cn("flex size-11 shrink-0 items-center justify-center rounded-xl", look.tone)}>
                    <look.icon className="size-5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-bold text-slate-900">{m.name}</span>
                    <span className="block text-xs text-slate-500">{m.redirect ? "Pay on Pesepay's secure page" : "Approve on your phone"}</span>
                  </span>
                  <span
                    aria-hidden
                    className={cn("flex size-5 shrink-0 items-center justify-center rounded-full border-2", selected === m.code ? "border-brand-orange" : "border-slate-300")}
                  >
                    {selected === m.code && <span className="size-2.5 rounded-full bg-brand-orange" />}
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>
      </section>

      {method && (
        <section className="rounded-3xl bg-white p-6 shadow-[0_1px_3px_rgba(15,23,42,0.04)] sm:p-7">
          <h2 className="text-lg font-bold text-slate-900">2. Your details</h2>
          <div className="mt-4 space-y-4">
            <div>
              <p className="text-sm font-semibold text-slate-700">Receipt email</p>
              <p className="mt-1 rounded-xl bg-slate-50 px-3.5 py-2.5 text-sm text-slate-600">{email}</p>
            </div>
            {method.fields.map((f) => {
              const phone = /phone/i.test(f.name);
              return (
                <label key={f.name} className="block space-y-1.5">
                  <span className="text-sm font-semibold text-slate-700">
                    {f.label}
                    {f.optional && <span className="ml-1.5 font-normal text-slate-400">(optional)</span>}
                  </span>
                  <input
                    type={phone ? "tel" : f.type === "NUMBER" ? "number" : f.type === "DATE" ? "date" : "text"}
                    inputMode={phone ? "tel" : undefined}
                    autoComplete={phone ? "tel-national" : "off"}
                    placeholder={phone ? "e.g. 0771 234 567" : undefined}
                    value={values[f.name] ?? ""}
                    onChange={(e) => setValues((v) => ({ ...v, [f.name]: e.target.value }))}
                    className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-[0.95rem] text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/10"
                  />
                  {phone && <span className="block text-xs text-slate-500">We&apos;ll send a payment prompt to this number. Keep your phone nearby.</span>}
                </label>
              );
            })}
            {method.redirect && (
              <p className="flex items-start gap-2 rounded-xl bg-brand-blue/5 px-3.5 py-3 text-sm text-brand-blue">
                <ExternalLink className="mt-0.5 size-4 shrink-0" />
                You&apos;ll finish on Pesepay&apos;s secure page (card details or QR code are entered there, never on MoreSo Tech), then come straight back here.
              </p>
            )}
          </div>
        </section>
      )}

      {error && (
        <p role="alert" className="flex items-start gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          <CircleAlert className="mt-0.5 size-4 shrink-0" /> {error}
        </p>
      )}

      <button
        type="submit"
        disabled={!method || pending}
        className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-brand-orange text-base font-bold text-white shadow-[0_12px_28px_-10px_rgba(245,130,32,0.7)] transition hover:bg-brand-orange-dark disabled:opacity-60"
      >
        {pending ? <LoaderCircle className="size-5 animate-spin" /> : <Lock className="size-5" />}
        {pending ? "Starting secure payment…" : `Pay ${amountLabel}${method ? ` with ${method.name}` : ""}`}
      </button>
    </form>
  );
}
