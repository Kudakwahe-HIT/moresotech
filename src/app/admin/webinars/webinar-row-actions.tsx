"use client";

import Link from "next/link";
import { useTransition } from "react";
import { Ban, LoaderCircle, Pencil, RotateCcw, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { deleteTeachWebinar, setTeachWebinarCancelled } from "@/app/teach/webinars/actions";
import { deleteWebinar, setWebinarCancelled } from "./actions";

/** Edit / cancel / delete controls, for the back office (admin) or an instructor's own sessions (teach). */
export function WebinarRowActions({ id, title, cancelled, area = "admin" }: { id: string; title: string; cancelled: boolean; area?: "admin" | "teach" }) {
  const [pending, start] = useTransition();
  const setCancelled = area === "teach" ? setTeachWebinarCancelled : setWebinarCancelled;
  const remove = area === "teach" ? deleteTeachWebinar : deleteWebinar;
  const run = (fn: () => Promise<{ error?: string }>, ok: string) =>
    start(async () => {
      const r = await fn();
      if (r.error) toast.error(r.error);
      else toast.success(ok, { description: title });
    });

  return (
    <div className="flex items-center justify-end gap-1">
      {pending && <LoaderCircle className="mr-1 size-4 animate-spin text-slate-400" />}
      <Link href={`/${area}/webinars/${id}/edit`} aria-label={`Edit ${title}`} title="Edit" className="flex size-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-800">
        <Pencil className="size-4" />
      </Link>
      <button
        type="button"
        disabled={pending}
        aria-label={cancelled ? `Restore ${title}` : `Cancel ${title}`}
        title={cancelled ? "Restore" : "Cancel session"}
        onClick={() => run(() => setCancelled(id, !cancelled), cancelled ? "Session restored" : "Session cancelled")}
        className="flex size-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-amber-50 hover:text-amber-700"
      >
        {cancelled ? <RotateCcw className="size-4" /> : <Ban className="size-4" />}
      </button>
      <button
        type="button"
        disabled={pending}
        aria-label={`Delete ${title}`}
        title="Delete"
        onClick={() => confirm(`Delete "${title}"? Registrations are removed too.`) && run(() => remove(id), "Session deleted")}
        className="flex size-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-600"
      >
        <Trash2 className="size-4" />
      </button>
    </div>
  );
}
