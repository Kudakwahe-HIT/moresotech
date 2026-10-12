"use client";

import Image from "next/image";
import type { LandingPhoto } from "@/lib/landing-photos";
import { cn } from "@/lib/utils";

/** Unsplash's CDN resizes and picks AVIF/WebP itself, so each screen downloads only what it needs. */
function unsplashLoader({ src, width, quality }: { src: string; width: number; quality?: number }) {
  return `${src}?auto=format&fit=crop&w=${width}&q=${quality ?? 72}`;
}

/** A landing-page photo that fills its (relatively positioned) parent. */
export function Photo({ photo, sizes, preload, className }: { photo: LandingPhoto; sizes: string; preload?: boolean; className?: string }) {
  return (
    <Image
      src={photo.src}
      alt={photo.alt}
      loader={unsplashLoader}
      fill
      sizes={sizes}
      preload={preload}
      className={cn("object-cover", className)}
      style={photo.focus ? { objectPosition: photo.focus } : undefined}
    />
  );
}
