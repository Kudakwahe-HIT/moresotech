"use client";

import Link from "next/link";
import { useTransition } from "react";
import { Ban, LoaderCircle, Pencil, RotateCcw, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { deleteWebinar, setWebinarCancelled } from "./actions";

export function WebinarRowActions({ id, title, cancelled }: { id: string; title: string; cancelled: boolean }) {
  const [pending, start] = useTransition();
  const run = (fn: () => Promise<{ error?: string }>, ok: string) =>
    start(async () => {
      const r = await fn();
      if (r.error) toast.error(r.error);
      else toast.success(ok, { description: title });
    });

  return (
    <div className="flex items-center justify-end gap-1">
      {pending && <LoaderCircle className="mr-1 size-4 animate-spin text-slate-400" />}
      <Link href={`/admin/webinars/${id}/edit`} aria-label={`Edit ${title}`} title="Edit" className="flex size-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-800">
        <Pencil className="size-4" />
      </Link>
      <button
        type="button"
        disabled={pending}
        aria-label={cancelled ? `Restore ${title}` : `Cancel ${title}`}
        title={cancelled ? "Restore" : "Cancel session"}
        onClick={() => run(() => setWebinarCancelled(id, !cancelled), cancelled ? "Session restored" : "Session cancelled")}
        className="flex size-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-amber-50 hover:text-amber-700"
      >
        {cancelled ? <RotateCcw className="size-4" /> : <Ban className="size-4" />}
      </button>
      <button
        type="button"
        disabled={pending}
        aria-label={`Delete ${title}`}
        title="Delete"
        onClick={() => confirm(`Delete "${title}"? Registrations are removed too.`) && run(() => deleteWebinar(id), "Session deleted")}
        className="flex size-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-600"
      >
        <Trash2 className="size-4" />
      </button>
    </div>
  );
}
