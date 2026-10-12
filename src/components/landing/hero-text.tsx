import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";

/*
 * Above-the-fold entrances use CSS animations (the .hero-* classes in globals.css), not JavaScript,
 * so the headline and photos are on screen as soon as the HTML arrives, even on slow mobile data.
 */

const delay = (seconds: number): CSSProperties => ({ animationDelay: `${seconds}s` });

/**
 * Headline that slides in word by word from behind a mask. Lines are separate strings;
 * `accent` lines get the brand colour. Screen readers get the whole sentence once.
 */
export function WordsReveal({ lines, className, start = 0.1 }: { lines: { text: string; accent?: boolean }[]; className?: string; start?: number }) {
  let index = 0;
  return (
    <h1 className={className} aria-label={lines.map((l) => l.text).join(" ")}>
      {lines.map((line, li) => {
        const words = line.text.split(" ");
        return (
          <span key={li} aria-hidden className={cn("block", line.accent && "text-brand-orange")}>
            {words.map((word, wi) => (
              <span key={wi} className="inline-block overflow-hidden pb-[0.08em] align-bottom">
                <span className="hero-word inline-block" style={delay(start + index++ * 0.07)}>
                  {word}
                  {wi < words.length - 1 ? " " : ""}
                </span>
              </span>
            ))}
          </span>
        );
      })}
    </h1>
  );
}

/** Fades content up on first paint, after `at` seconds. */
export function HeroIn({ children, at = 0, className }: { children: ReactNode; at?: number; className?: string }) {
  return (
    <div className={cn("hero-in", className)} style={delay(at)}>
      {children}
    </div>
  );
}

/** Photo frame that settles in from a slight zoom on first paint. */
export function HeroPhoto({ children, at = 0, className }: { children: ReactNode; at?: number; className?: string }) {
  return (
    <div className={cn("hero-photo overflow-hidden", className)} style={delay(at)}>
      {children}
    </div>
  );
}

/** Fades in, then floats gently up and down. */
export function HeroFloat({ children, at = 0, className }: { children: ReactNode; at?: number; className?: string }) {
  return (
    <div className={cn("hero-float", className)} style={{ animationDelay: `${at}s, ${at + 0.8}s` }}>
      {children}
    </div>
  );
}
