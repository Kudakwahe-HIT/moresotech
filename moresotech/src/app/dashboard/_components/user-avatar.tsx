import Image from "next/image";
import { cn } from "@/lib/utils";

type UserAvatarProps = {
  imageUrl: string;
  hasImage: boolean;
  name: string;
  size: number;
  className?: string;
};

/** The user's photo, or brand-coloured initials when they haven't uploaded one. */
export function UserAvatar({ imageUrl, hasImage, name, size, className }: UserAvatarProps) {
  if (hasImage) {
    return (
      <Image
        src={imageUrl}
        alt=""
        width={size}
        height={size}
        unoptimized
        style={{ width: size, height: size }}
        className={cn("shrink-0 rounded-full object-cover", className)}
      />
    );
  }

  const initials =
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "?";

  return (
    <span
      aria-hidden
      style={{ width: size, height: size, fontSize: size * 0.38 }}
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-blue to-[#1f7ac4] font-bold text-white",
        className,
      )}
    >
      {initials}
    </span>
  );
}
