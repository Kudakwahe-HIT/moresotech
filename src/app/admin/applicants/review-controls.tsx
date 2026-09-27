"use client";

import { useState, useTransition } from "react";
import { AlertDialog } from "@base-ui/react/alert-dialog";
import { CircleCheck, CircleX, LoaderCircle, MessageSquareWarning, PlayCircle, RotateCcw, Trophy } from "lucide-react";
import { toast } from "sonner";
import type { ApplicationStatus } from "@/db/schema";
import type { ActionResult } from "@/lib/action-result";
import { cn } from "@/lib/utils";
import { decideApplication, reviewDocument } from "./actions";

function useAction() {
  const [pending, startTransition] = useTransition();
  function run(action: () => Promise<ActionResult>, success: string, onDone?: () => void) {
    startTransition(async () => {
      try {
        const result = await action();
        if (result.error) toast.error(result.error);
        else {
          toast.success(success);
          onDone?.();
        }
      } catch {
        toast.error("Something went wrong. Please try again.");
      }
    });
  }
  return { pending, run };
}

/** Verify / Request revision buttons next to an uploaded document. */
export function DocumentReviewButtons({ documentId, label, status }: { documentId: string; label: string; status: string }) {
  const { pending, run } = useAction();
  const [open, setOpen] = useState(false);

  return (
    <>
      {status !== "verified" && (
        <button
          type="button"
          disabled={pending}
          onClick={() => run(() => reviewDocument(documentId, "verified"), `${label} verified`)}
          className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-emerald-600 px-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-60"
        >
          {pending ? <LoaderCircle className="size-4 animate-spin" /> : <CircleCheck className="size-4" />} Verify
        </button>
      )}
      <button
        type="button"
        disabled={pending}
        onClick={() => setOpen(true)}
        className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:opacity-60"
      >
        <RotateCcw className="size-4" /> Request revision
      </button>
      <NoteDialog
        open={open}
        onOpenChange={setOpen}
        title={`Request a new ${label}`}
        description="The student will see this note and can upload a corrected file."
        placeholder="e.g. The scan is cut off at the bottom. Please upload all pages, clearly readable."
        confirmLabel="Send to student"
        danger
        pending={pending}
        onConfirm={(note) => run(() => reviewDocument(documentId, "needs_revision", note), "Revision requested", () => setOpen(false))}
      />
    </>
  );
}

type Decision = "under_review" | "changes_requested" | "approved" | "rejected";

/** Assessment actions for a submitted application. */
export function DecisionPanel({ applicationId, status }: { applicationId: string; status: ApplicationStatus }) {
  const { pending, run } = useAction();
  const [dialog, setDialog] = useState<Decision | null>(null);

  if (!["submitted", "under_review"].includes(status)) {
    return (
      <p className="text-sm text-slate-500">
        {status === "draft" || status === "changes_requested"
          ? "Decisions unlock once the student submits. Keep verifying documents as they come in."
          : "A decision has been made on this application."}
      </p>
    );
  }

  const dialogs: Record<Exclude<Decision, "under_review">, { title: string; description: string; confirm: string; placeholder: string; danger?: boolean; required: boolean }> = {
    approved: {
      title: "Approve this application?",
      description: "Optionally add a message for the student about next steps.",
      confirm: "Approve",
      placeholder: "e.g. Congratulations! Your application has been forwarded to the embassy.",
      required: false,
    },
    changes_requested: {
      title: "Request changes",
      description: "The application goes back to the student to fix and resubmit.",
      confirm: "Send back to student",
      placeholder: "e.g. Your personal statement must be signed and dated.",
      required: true,
    },
    rejected: {
      title: "Mark as not successful?",
      description: "Explain the reason kindly. The student will see this message.",
      confirm: "Confirm decision",
      placeholder: "e.g. Unfortunately you don't meet the minimum GPA requirement for this scholarship.",
      danger: true,
      required: true,
    },
  };
  const active = dialog && dialog !== "under_review" ? dialogs[dialog] : null;

  return (
    <div className="space-y-2">
      {status === "submitted" && (
        <DecisionButton
          icon={PlayCircle}
          label="Start assessment"
          className="bg-[#0f1b2d] text-white hover:bg-[#1a2a42]"
          disabled={pending}
          onClick={() => run(() => decideApplication(applicationId, "under_review"), "Assessment started")}
        />
      )}
      <DecisionButton icon={Trophy} label="Approve" className="bg-emerald-600 text-white hover:bg-emerald-700" disabled={pending} onClick={() => setDialog("approved")} />
      <DecisionButton
        icon={MessageSquareWarning}
        label="Request changes"
        className="border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
        disabled={pending}
        onClick={() => setDialog("changes_requested")}
      />
      <DecisionButton
        icon={CircleX}
        label="Not successful"
        className="border border-slate-200 bg-white text-red-600 hover:border-red-200 hover:bg-red-50"
        disabled={pending}
        onClick={() => setDialog("rejected")}
      />

      {active && dialog && (
        <NoteDialog
          open
          onOpenChange={(o) => !o && setDialog(null)}
          title={active.title}
          description={active.description}
          placeholder={active.placeholder}
          confirmLabel={active.confirm}
          danger={active.danger}
          required={active.required}
          pending={pending}
          onConfirm={(note) =>
            run(() => decideApplication(applicationId, dialog, note), active.confirm === "Approve" ? "Application approved" : "Decision saved", () => setDialog(null))
          }
        />
      )}
    </div>
  );
}

function DecisionButton({
  icon: Icon,
  label,
  className,
  disabled,
  onClick,
}: {
  icon: typeof Trophy;
  label: string;
  className: string;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn("flex h-11 w-full items-center justify-center gap-2 rounded-xl text-sm font-semibold transition disabled:opacity-60", className)}
    >
      <Icon className="size-4" /> {label}
    </button>
  );
}

function NoteDialog({
  open,
  onOpenChange,
  title,
  description,
  placeholder,
  confirmLabel,
  danger,
  required = true,
  pending,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  placeholder: string;
  confirmLabel: string;
  danger?: boolean;
  required?: boolean;
  pending: boolean;
  onConfirm: (note: string) => void;
}) {
  const [note, setNote] = useState("");
  const invalid = required && !note.trim();

  return (
    <AlertDialog.Root open={open} onOpenChange={onOpenChange}>
      <AlertDialog.Portal>
        <AlertDialog.Backdrop className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-150 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0" />
        <AlertDialog.Popup className="fixed left-1/2 top-1/2 z-50 w-[min(480px,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 rounded-3xl bg-white p-6 shadow-2xl outline-none transition-[opacity,transform] duration-150 data-[ending-style]:scale-95 data-[ending-style]:opacity-0 data-[starting-style]:scale-95 data-[starting-style]:opacity-0">
          <AlertDialog.Title className="text-lg font-bold text-slate-900">{title}</AlertDialog.Title>
          <AlertDialog.Description className="mt-1 text-sm text-slate-500">{description}</AlertDialog.Description>
          <label htmlFor="review-note" className="mt-5 block text-sm font-semibold text-slate-700">
            Message to the student {!required && <span className="font-normal text-slate-400">(optional)</span>}
          </label>
          <textarea
            id="review-note"
            rows={4}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={placeholder}
            maxLength={1000}
            className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/10"
          />
          <div className="mt-5 flex justify-end gap-2">
            <AlertDialog.Close className="h-10 rounded-xl px-4 text-sm font-semibold text-slate-600 transition hover:bg-slate-100">Cancel</AlertDialog.Close>
            <button
              type="button"
              disabled={invalid || pending}
              onClick={() => onConfirm(note)}
              className={cn(
                "inline-flex h-10 items-center gap-2 rounded-xl px-4 text-sm font-semibold text-white transition disabled:opacity-50",
                danger ? "bg-red-600 hover:bg-red-700" : "bg-brand-blue hover:bg-brand-blue-dark",
              )}
            >
              {pending && <LoaderCircle className="size-4 animate-spin" />}
              {confirmLabel}
            </button>
          </div>
        </AlertDialog.Popup>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
