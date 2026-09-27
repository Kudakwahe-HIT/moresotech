import Image from "next/image";
import { GraduationCap } from "lucide-react";
import { coverUrl } from "@/lib/course-cover";
import { cn } from "@/lib/utils";

const CATEGORY_TONES: Record<string, string> = {
  language: "from-brand-blue to-[#1f7ac4]",
  test_prep: "from-brand-orange to-[#f7a24f]",
  documents: "from-emerald-600 to-emerald-400",
  interview: "from-violet-600 to-violet-400",
  other: "from-slate-700 to-slate-500",
};

type Props = {
  course: { id: string; title: string; category: string; coverImage: string | null };
  className?: string;
  sizes?: string;
  preload?: boolean;
};

/** The course's picture, or a category-coloured gradient when it has none. Size it with `className`. */
export function CourseCover({ course, className, sizes = "(min-width: 1280px) 33vw, (min-width: 640px) 50vw, 100vw", preload }: Props) {
  const src = coverUrl(course);
  return (
    <div className={cn("relative overflow-hidden bg-gradient-to-br", CATEGORY_TONES[course.category] ?? CATEGORY_TONES.other, className)}>
      {src ? (
        // Served from our own API route (private storage), already resized on upload.
        <Image src={src} alt="" fill unoptimized sizes={sizes} preload={preload} className="object-cover" />
      ) : (
        <GraduationCap aria-hidden className="absolute right-4 top-4 size-14 text-white/20" />
      )}
    </div>
  );
}
