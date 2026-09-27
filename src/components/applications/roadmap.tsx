import { Award, Check, ClipboardCheck, FileText, Flag, Lock, Rocket, type LucideIcon } from "lucide-react";
import type { ApplicationStatus } from "@/db/schema";
import type { ApplicationProgress } from "@/lib/application-rules";
import { cn } from "@/lib/utils";

type StepState = "done" | "current" | "locked" | "failed";
type Step = { title: string; detail: string; state: StepState; icon: LucideIcon };

/** The guided "quest" view of an application: what's done, what's next, what's locked. */
export function Roadmap({ status, progress }: { status: ApplicationStatus; progress: ApplicationProgress }) {
  const certs = progress.items.filter((i) => i.kind === "certificate");
  const docs = progress.items.filter((i) => i.kind === "document");
  const certsDone = certs.filter((i) => i.status === "verified").length;
  const docsDone = docs.filter((i) => i.status === "verified").length;
  const submitted = !["draft", "changes_requested"].includes(status);
  const decided = status === "approved" || status === "rejected";

  const stageState = (done: boolean, started: boolean): StepState => (done ? "done" : started ? "current" : "locked");

  const steps: Step[] = [
    { title: "Profile & target", detail: "Application started", state: "done", icon: Rocket },
    ...(certs.length
      ? [
          {
            title: "Certificates",
            detail: `${certsDone} of ${certs.length} verified`,
            state: stageState(certsDone === certs.length, true),
            icon: Award,
          },
        ]
      : []),
    {
      title: "Document vault",
      detail: docs.length ? `${docsDone} of ${docs.length} verified` : "No documents required",
      state: stageState(docsDone === docs.length, true),
      icon: FileText,
    },
    {
      title: "MoreSo review",
      detail: submitted
        ? status === "submitted"
          ? "Submitted, waiting for a reviewer"
          : status === "under_review"
            ? "A reviewer is assessing it"
            : "Assessment complete"
        : progress.allVerified
          ? "Ready to submit"
          : "Unlocks when everything is verified",
      state: submitted ? (decided ? "done" : "current") : progress.allVerified ? "current" : "locked",
      icon: ClipboardCheck,
    },
    {
      title: "Decision",
      detail: status === "approved" ? "Approved" : status === "rejected" ? "Not successful this time" : "After assessment",
      state: status === "approved" ? "done" : status === "rejected" ? "failed" : "locked",
      icon: Flag,
    },
  ];

  return (
    <ol className="grid gap-3 sm:grid-cols-2 xl:grid-cols-none xl:auto-cols-fr xl:grid-flow-col">
      {steps.map((step, i) => (
        <li
          key={step.title}
          className={cn(
            "relative flex items-start gap-3 rounded-2xl p-4 ring-1 transition",
            step.state === "done" && "bg-emerald-50/60 ring-emerald-100",
            step.state === "current" && "bg-white shadow-[0_8px_24px_-12px_rgba(245,130,32,0.45)] ring-brand-orange/40",
            step.state === "locked" && "bg-slate-50 ring-slate-100",
            step.state === "failed" && "bg-red-50/60 ring-red-100",
          )}
        >
          <span
            className={cn(
              "flex size-9 shrink-0 items-center justify-center rounded-xl",
              step.state === "done" && "bg-emerald-500 text-white",
              step.state === "current" && "bg-brand-orange text-white",
              step.state === "locked" && "bg-slate-200 text-slate-400",
              step.state === "failed" && "bg-red-500 text-white",
            )}
          >
            {step.state === "done" ? <Check className="size-4" strokeWidth={3} /> : step.state === "locked" ? <Lock className="size-4" /> : <step.icon className="size-4" />}
          </span>
          <div className="min-w-0">
            <p className="text-[0.7rem] font-bold uppercase tracking-wider text-slate-400">Step {i + 1}</p>
            <p className={cn("text-sm font-bold", step.state === "locked" ? "text-slate-400" : "text-slate-900")}>{step.title}</p>
            <p className="mt-0.5 text-xs text-slate-500">{step.detail}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
