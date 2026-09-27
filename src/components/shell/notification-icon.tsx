import {
  Camera,
  CircleCheck,
  CircleX,
  GraduationCap,
  Hourglass,
  MailWarning,
  MessageSquareWarning,
  PartyPopper,
  RotateCcw,
  Send,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { NotificationKind } from "@/lib/notifications";

const ICONS: Record<NotificationKind, { icon: LucideIcon; tone: string }> = {
  welcome: { icon: PartyPopper, tone: "bg-brand-orange/10 text-brand-orange-dark" },
  "verify-email": { icon: MailWarning, tone: "bg-amber-500/10 text-amber-600" },
  "add-photo": { icon: Camera, tone: "bg-violet-500/10 text-violet-600" },
  "first-application": { icon: GraduationCap, tone: "bg-brand-blue/10 text-brand-blue" },
  revision: { icon: RotateCcw, tone: "bg-red-500/10 text-red-600" },
  changes: { icon: MessageSquareWarning, tone: "bg-brand-orange/10 text-brand-orange-dark" },
  ready: { icon: Send, tone: "bg-emerald-500/10 text-emerald-600" },
  "in-review": { icon: Hourglass, tone: "bg-amber-500/10 text-amber-600" },
  approved: { icon: CircleCheck, tone: "bg-emerald-500/10 text-emerald-600" },
  rejected: { icon: CircleX, tone: "bg-slate-500/10 text-slate-600" },
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
