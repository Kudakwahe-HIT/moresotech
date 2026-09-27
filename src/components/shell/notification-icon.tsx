import { BookOpen, Camera, MailWarning, PartyPopper, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { NotificationKind } from "@/lib/notifications";

const ICONS: Record<NotificationKind, { icon: LucideIcon; tone: string }> = {
  welcome: { icon: PartyPopper, tone: "bg-brand-orange/10 text-brand-orange-dark" },
  "verify-email": { icon: MailWarning, tone: "bg-amber-500/10 text-amber-600" },
  "add-photo": { icon: Camera, tone: "bg-violet-500/10 text-violet-600" },
  "first-course": { icon: BookOpen, tone: "bg-brand-blue/10 text-brand-blue" },
};

export function NotificationIcon({ kind, size = "md" }: { kind: NotificationKind; size?: "md" | "lg" }) {
  const { icon: Icon, tone } = ICONS[kind];
  return (
    <span
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full",
        size === "lg" ? "size-12" : "size-10",
        tone,
      )}
    >
      <Icon className={size === "lg" ? "size-5" : "size-[18px]"} />
    </span>
  );
}
