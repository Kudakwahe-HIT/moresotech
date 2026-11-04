"use client";

import Image from "next/image";
import type { LandingPhoto } from "@/lib/landing-photos";
import { cn } from "@/lib/utils";

/** A landing-page photo that fills its (relatively positioned) parent. */
export function Photo({ photo, sizes, preload, className }: { photo: LandingPhoto; sizes: string; preload?: boolean; className?: string }) {
  return (
    <Image
      src={photo.src}
      alt={photo.alt}
      fill
      sizes={sizes}
      preload={preload}
      className={cn("object-cover", className)}
      style={photo.focus ? { objectPosition: photo.focus } : undefined}
    />
  );
}
