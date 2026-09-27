import Link from "next/link";
import { ArrowRight, Megaphone } from "lucide-react";
import { cn } from "@/lib/utils";

/** The admin-set announcement. `preview` renders the link as plain text (used in Settings). */
export function AnnouncementBar({ text, link, preview, className }: { text: string; link: string | null; preview?: boolean; className?: string }) {
  const external = link?.startsWith("http");
  const cta = (
    <span className="inline-flex shrink-0 items-center gap-1 font-semibold text-brand-orange underline-offset-2 group-hover:underline">
      Learn more <ArrowRight className="size-3.5" />
    </span>
  );

  return (
    <div role="status" className={cn("flex items-center gap-3 rounded-2xl bg-[#0f1b2d] px-4 py-3 text-sm text-white", className)}>
      <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-white/10 text-brand-orange">
        <Megaphone className="size-4" />
      </span>
      <p className="min-w-0 flex-1 leading-snug">{text}</p>
      {link &&
        (preview ? (
          <span className="group">{cta}</span>
        ) : external ? (
          <a href={link} target="_blank" rel="noopener noreferrer" className="group">
            {cta}
          </a>
        ) : (
          <Link href={link} className="group">
            {cta}
          </Link>
        ))}
    </div>
  );
}
