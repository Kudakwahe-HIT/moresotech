"use client";

import { useRef, useState, type DragEvent } from "react";
import { upload } from "@vercel/blob/client";
import { ImagePlus, LoaderCircle, RefreshCw, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { COVER_MAX_WIDTH, COVER_PREFIX, COVER_TYPES } from "@/lib/course-cover";
import { cn } from "@/lib/utils";

/** Original files up to this size are accepted; they're shrunk before upload. */
const MAX_SOURCE_BYTES = 20 * 1024 * 1024;

type Props = {
  name: string;
  /** Current Blob pathname, if the course already has a picture. */
  defaultPath?: string | null;
  /** URL to preview the current picture. */
  defaultUrl?: string | null;
  error?: string;
};

/** Resizes to at most COVER_MAX_WIDTH wide and re-encodes as WebP (JPEG where WebP isn't supported). */
async function shrink(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, COVER_MAX_WIDTH / bitmap.width);
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  const encode = (type: string) => new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, 0.85));
  const webp = await encode("image/webp");
  if (webp?.type === "image/webp") return webp;
  const jpeg = await encode("image/jpeg");
  if (!jpeg) throw new Error("This picture couldn't be read.");
  return jpeg;
}

/**
 * Course cover picture: click or drop an image, see it straight away, replace or remove it.
 * The picture uploads immediately; the course only uses it once the form is saved.
 */
export function CoverImageInput({ name, defaultPath, defaultUrl, error }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [path, setPath] = useState(defaultPath ?? "");
  const [preview, setPreview] = useState(defaultUrl ?? null);
  const [progress, setProgress] = useState<number | null>(null);
  const [dragging, setDragging] = useState(false);
  const busy = progress !== null;

  async function handleFile(file: File | undefined) {
    if (!file) return;
    if (!COVER_TYPES.includes(file.type)) return toast.error("Use a JPG, PNG or WebP picture");
    if (file.size > MAX_SOURCE_BYTES) return toast.error("That picture is too large", { description: "Choose one under 20 MB." });

    setProgress(0);
    const local = URL.createObjectURL(file);
    const previous = preview;
    setPreview(local);
    try {
      const image = await shrink(file);
      const ext = image.type === "image/webp" ? "webp" : "jpg";
      const blob = await upload(`${COVER_PREFIX}cover.${ext}`, image, {
        access: "private",
        contentType: image.type,
        handleUploadUrl: "/api/courses/cover-upload",
        onUploadProgress: ({ percentage }) => setProgress(Math.round(percentage)),
      });
      setPath(blob.pathname);
      toast.success("Picture ready", { description: "Save the course to use it." });
    } catch (err) {
      URL.revokeObjectURL(local);
      setPreview(previous);
      toast.error("Upload failed", { description: err instanceof Error ? err.message : "Please try again." });
    } finally {
      setProgress(null);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function onDrop(event: DragEvent) {
    event.preventDefault();
    setDragging(false);
    if (!busy) handleFile(event.dataTransfer.files[0]);
  }

  function removePicture() {
    if (preview?.startsWith("blob:")) URL.revokeObjectURL(preview);
    setPreview(null);
    setPath("");
  }

  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-sm font-semibold text-slate-700">
          Cover picture <span className="ml-1 font-normal text-slate-400">Shown on the website and course cards</span>
        </span>
      </div>

      <input type="hidden" name={name} value={path} />
      <input
        ref={inputRef}
        type="file"
        accept={COVER_TYPES.join(",")}
        className="sr-only"
        tabIndex={-1}
        aria-hidden
        onChange={(e) => handleFile(e.target.files?.[0])}
      />

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={cn(
          "relative aspect-[16/9] w-full overflow-hidden rounded-2xl transition",
          preview ? "bg-slate-900" : "border-2 border-dashed bg-slate-50/60",
          dragging ? "border-brand-blue ring-4 ring-brand-blue/10" : error ? "border-red-300" : "border-slate-300",
        )}
      >
        {preview ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element -- local blob: previews can't go through next/image */}
            <img src={preview} alt="Course cover preview" className={cn("size-full object-cover transition", busy && "opacity-60")} />
            <div className="absolute inset-x-0 bottom-0 flex justify-end gap-2 bg-gradient-to-t from-black/60 to-transparent p-3 pt-10">
              <button
                type="button"
                disabled={busy}
                onClick={() => inputRef.current?.click()}
                className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-white/90 px-3 text-sm font-semibold text-slate-800 backdrop-blur transition hover:bg-white disabled:opacity-60"
              >
                <RefreshCw className="size-4" /> Replace
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={removePicture}
                aria-label="Remove cover picture"
                className="inline-flex size-9 items-center justify-center rounded-xl bg-white/90 text-red-600 backdrop-blur transition hover:bg-white disabled:opacity-60"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          </>
        ) : (
          <button
            type="button"
            disabled={busy}
            onClick={() => inputRef.current?.click()}
            className="flex size-full flex-col items-center justify-center gap-2 text-center"
          >
            <span className="flex size-12 items-center justify-center rounded-2xl bg-brand-blue/10 text-brand-blue">
              <ImagePlus className="size-6" />
            </span>
            <span className="text-sm font-semibold text-slate-800">Click to upload or drag a picture here</span>
            <span className="text-xs text-slate-500">JPG, PNG or WebP · landscape works best (16:9, e.g. 1600 × 900)</span>
          </button>
        )}

        {busy && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/95 px-4 py-2 text-sm font-semibold text-slate-800 shadow-lg">
              <LoaderCircle className="size-4 animate-spin" /> Uploading {progress}%
            </span>
          </div>
        )}
      </div>

      {error && <p className="text-[0.8rem] font-medium text-red-600">{error}</p>}
    </div>
  );
}
