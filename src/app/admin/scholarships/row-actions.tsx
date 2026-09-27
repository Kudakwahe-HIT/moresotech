"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { Menu } from "@base-ui/react/menu";
import { AlertDialog } from "@base-ui/react/alert-dialog";
import { Archive, Eye, EyeOff, LoaderCircle, MoreHorizontal, Pencil, Star, StarOff, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { ScholarshipStatus } from "@/db/schema";
import type { ActionResult } from "@/lib/action-result";
import { deleteScholarship, setScholarshipFeatured, setScholarshipStatus } from "./actions";

type Props = { id: string; title: string; status: ScholarshipStatus; featured: boolean };

export function RowActions({ id, title, status, featured }: Props) {
  const [pending, startTransition] = useTransition();
  const [confirmOpen, setConfirmOpen] = useState(false);

  function run(action: () => Promise<ActionResult | void>, success: string) {
    startTransition(async () => {
      try {
        const result = await action();
        if (result?.error) toast.error(result.error);
        else toast.success(success, { description: title });
      } catch {
        toast.error("Something went wrong. Please try again.");
      }
    });
  }

  return (
    <>
      <Menu.Root>
        <Menu.Trigger
          aria-label={`Actions for ${title}`}
          disabled={pending}
          className="flex size-9 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/30 data-[popup-open]:bg-slate-100"
        >
          {pending ? <LoaderCircle className="size-4 animate-spin" /> : <MoreHorizontal className="size-4" />}
        </Menu.Trigger>
        <Menu.Portal>
          <Menu.Positioner side="bottom" align="end" sideOffset={6} className="z-50 outline-none">
            <Menu.Popup className="w-56 origin-(--transform-origin) rounded-2xl bg-white p-1.5 shadow-[0_20px_50px_-12px_rgba(15,23,42,0.25)] ring-1 ring-slate-900/5 outline-none transition-[opacity,transform] duration-150 data-[ending-style]:scale-95 data-[ending-style]:opacity-0 data-[starting-style]:scale-95 data-[starting-style]:opacity-0">
              <Menu.LinkItem closeOnClick render={<Link href={`/admin/scholarships/${id}/edit`} />} className={item}>
                <Pencil className="size-4 text-slate-400" /> Edit
              </Menu.LinkItem>
              {status !== "published" ? (
                <Menu.Item className={item} onClick={() => run(() => setScholarshipStatus(id, "published"), "Published")}>
                  <Eye className="size-4 text-emerald-500" /> Publish
                </Menu.Item>
              ) : (
                <Menu.Item className={item} onClick={() => run(() => setScholarshipStatus(id, "draft"), "Moved back to drafts")}>
                  <EyeOff className="size-4 text-slate-400" /> Unpublish
                </Menu.Item>
              )}
              {status !== "closed" && (
                <Menu.Item className={item} onClick={() => run(() => setScholarshipStatus(id, "closed"), "Marked as closed")}>
                  <Archive className="size-4 text-slate-400" /> Mark as closed
                </Menu.Item>
              )}
              <Menu.Item
                className={item}
                onClick={() => run(() => setScholarshipFeatured(id, !featured), featured ? "Removed from featured" : "Featured")}
              >
                {featured ? <StarOff className="size-4 text-slate-400" /> : <Star className="size-4 text-brand-orange" />}
                {featured ? "Unfeature" : "Feature"}
              </Menu.Item>
              <Menu.Separator className="mx-2 my-1 h-px bg-slate-100" />
              <Menu.Item className={`${item} text-red-600 data-[highlighted]:bg-red-50`} onClick={() => setConfirmOpen(true)}>
                <Trash2 className="size-4" /> Delete
              </Menu.Item>
            </Menu.Popup>
          </Menu.Positioner>
        </Menu.Portal>
      </Menu.Root>

      <AlertDialog.Root open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialog.Portal>
          <AlertDialog.Backdrop className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-150 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0" />
          <AlertDialog.Popup className="fixed left-1/2 top-1/2 z-50 w-[min(420px,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 rounded-3xl bg-white p-6 shadow-2xl outline-none transition-[opacity,transform] duration-150 data-[ending-style]:scale-95 data-[ending-style]:opacity-0 data-[starting-style]:scale-95 data-[starting-style]:opacity-0">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-red-50 text-red-600">
              <Trash2 className="size-6" />
            </div>
            <AlertDialog.Title className="mt-4 text-lg font-bold text-slate-900">Delete this scholarship?</AlertDialog.Title>
            <AlertDialog.Description className="mt-1.5 text-sm leading-relaxed text-slate-500">
              <span className="font-semibold text-slate-700">{title}</span> will be removed for everyone, including students who
              saved it. This can&apos;t be undone. To hide it instead, mark it as closed or unpublish it.
            </AlertDialog.Description>
            <div className="mt-6 flex justify-end gap-2">
              <AlertDialog.Close className="h-10 rounded-xl px-4 text-sm font-semibold text-slate-600 transition hover:bg-slate-100">
                Cancel
              </AlertDialog.Close>
              <button
                type="button"
                onClick={() => {
                  setConfirmOpen(false);
                  run(() => deleteScholarship(id), "Scholarship deleted");
                }}
                className="h-10 rounded-xl bg-red-600 px-4 text-sm font-semibold text-white transition hover:bg-red-700"
              >
                Delete scholarship
              </button>
            </div>
          </AlertDialog.Popup>
        </AlertDialog.Portal>
      </AlertDialog.Root>
    </>
  );
}

const item =
  "flex h-10 cursor-pointer select-none items-center gap-3 rounded-xl px-3 text-sm font-medium text-slate-700 outline-none transition-colors data-[highlighted]:bg-slate-100 data-[highlighted]:text-slate-900";
