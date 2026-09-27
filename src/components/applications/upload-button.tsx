"use client";

import { useRef, useState, type DragEvent } from "react";
import { useRouter } from "next/navigation";
import { upload } from "@vercel/blob/client";
import { LoaderCircle, RefreshCw, UploadCloud } from "lucide-react";
import { toast } from "sonner";
import { recordUpload } from "@/app/dashboard/applications/actions";
import { ALLOWED_UPLOAD_LABEL, ALLOWED_UPLOAD_TYPES, MAX_UPLOAD_BYTES } from "@/lib/application-rules";
import { cn } from "@/lib/utils";

type Props = {
  applicationId: string;
  requirementIndex: number;
  requirementLabel: string;
  /** Existing upload → show "Replace" instead of "Upload". */
  replace?: boolean;
};

/**
 * Uploads straight from the browser to private storage (with a progress bar), then asks the
 * server to record it. Accepts click-to-choose or drag-and-drop onto the button.
 */
export function UploadButton({ applicationId, requirementIndex, requirementLabel, replace }: Props) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [dragging, setDragging] = useState(false);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    if (!ALLOWED_UPLOAD_TYPES.includes(file.type)) return toast.error("Unsupported file type", { description: ALLOWED_UPLOAD_LABEL });
    if (file.size > MAX_UPLOAD_BYTES) return toast.error("File is too large", { description: ALLOWED_UPLOAD_LABEL });

    setProgress(0);
    try {
      const safeName = file.name.replace(/[^\w.\-]+/g, "_").slice(-80);
      const blob = await upload(`applications/${applicationId}/${safeName}`, file, {
        access: "private",
        handleUploadUrl: "/api/documents/upload",
        clientPayload: JSON.stringify({ applicationId }),
        onUploadProgress: ({ percentage }) => setProgress(Math.round(percentage)),
      });
      const result = await recordUpload({ applicationId, requirementIndex, pathname: blob.pathname, fileName: file.name });
      if (result.error) throw new Error(result.error);
      toast.success(`${requirementLabel} uploaded`, { description: "Our team will review it shortly." });
      router.refresh();
    } catch (error) {
      toast.error("Upload failed", { description: error instanceof Error ? error.message : "Please try again." });
    } finally {
      setProgress(null);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function onDrop(event: DragEvent) {
    event.preventDefault();
    setDragging(false);
    handleFile(event.dataTransfer.files[0]);
  }

  const busy = progress !== null;

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="file"
        accept={ALLOWED_UPLOAD_TYPES.join(",")}
        className="sr-only"
        tabIndex={-1}
        aria-hidden
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
      <button
        type="button"
        disabled={busy}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        aria-label={`${replace ? "Replace" : "Upload"} ${requirementLabel}`}
        className={cn(
          "relative inline-flex h-10 min-w-[7.5rem] items-center justify-center gap-2 overflow-hidden rounded-xl px-4 text-sm font-semibold transition disabled:cursor-wait",
          replace
            ? "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
            : "bg-brand-orange text-white shadow-[0_8px_20px_-8px_rgba(245,130,32,0.6)] hover:bg-brand-orange-dark",
          dragging && "ring-4 ring-brand-blue/20",
        )}
      >
        {busy && (
          <span
            aria-hidden
            className={cn("absolute inset-y-0 left-0 transition-[width]", replace ? "bg-brand-blue/10" : "bg-white/20")}
            style={{ width: `${progress}%` }}
          />
        )}
        <span className="relative flex items-center gap-2">
          {busy ? (
            <>
              <LoaderCircle className="size-4 animate-spin" /> {progress}%
            </>
          ) : replace ? (
            <>
              <RefreshCw className="size-4" /> Replace
            </>
          ) : (
            <>
              <UploadCloud className="size-4" /> Upload
            </>
          )}
        </span>
      </button>
    </div>
  );
}
