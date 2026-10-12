"use client";

import { useRef, type ReactNode } from "react";
import { MotionConfig, motion, useScroll, useSpring, useTransform, type Variants } from "framer-motion";
import { cn } from "@/lib/utils";

const EASE = [0.22, 1, 0.36, 1] as const;

/** Wrap the page once: every animation below is skipped for people who ask their device for less motion. */
export function MotionProvider({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}

/** Fades and lifts its content in the first time it scrolls into view. */
export function Reveal({ children, delay = 0, y = 28, className }: { children: ReactNode; delay?: number; y?: number; className?: string }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -12% 0px" }}
      transition={{ duration: 0.8, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

const stagger: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.09 } } };
const rise: Variants = { hidden: { opacity: 0, y: 26 }, show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } } };

/** A list whose items appear one after another. Put <StaggerItem> inside. */
export function Stagger({ children, className, as = "div" }: { children: ReactNode; className?: string; as?: "div" | "ul" | "ol" }) {
  const Tag = motion[as];
  return (
    <Tag className={className} variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "0px 0px -10% 0px" }}>
      {children}
    </Tag>
  );
}

export function StaggerItem({ children, className, as = "div" }: { children: ReactNode; className?: string; as?: "div" | "li" }) {
  const Tag = motion[as];
  return (
    <Tag className={className} variants={rise}>
      {children}
    </Tag>
  );
}

/** Content that drifts at a different speed from the page as it scrolls past (depth). */
export function Parallax({ children, offset = 60, className }: { children: ReactNode; offset?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [offset, -offset]);
  return (
    <motion.div ref={ref} style={{ y }} className={className}>
      {children}
    </motion.div>
  );
}

/** Photo that settles in from a slight zoom when it enters the screen. */
export function PhotoReveal({ children, className, delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  return (
    <motion.div
      className={cn("overflow-hidden", className)}
      initial={{ opacity: 0, scale: 1.08, clipPath: "inset(8% 8% 8% 8% round 28px)" }}
      whileInView={{ opacity: 1, scale: 1, clipPath: "inset(0% 0% 0% 0% round 28px)" }}
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      transition={{ duration: 1.1, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

/** Gentle up-and-down float for small cards over photos. */
export function Float({ children, className, delay = 0, distance = 8 }: { children: ReactNode; className?: string; delay?: number; distance?: number }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: [0, -distance, 0] }}
      transition={{
        opacity: { duration: 0.6, delay },
        y: { duration: 5, delay, repeat: Infinity, ease: "easeInOut" },
      }}
    >
      {children}
    </motion.div>
  );
}

/**
 * The journey line: a vertical route that draws itself as you scroll through the section,
 * with the content laid over it.
 */
export function RouteProgress({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 70%", "end 60%"] });
  const scaleY = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.4 });
  return (
    <div ref={ref} className={cn("relative", className)}>
      <div aria-hidden className="absolute bottom-0 left-[1.15rem] top-0 w-px bg-[repeating-linear-gradient(to_bottom,#cbd5e1_0_6px,transparent_6px_12px)] md:left-1/2" />
      <motion.div aria-hidden style={{ scaleY }} className="absolute bottom-0 left-[1.15rem] top-0 w-[3px] -translate-x-px origin-top rounded-full bg-gradient-to-b from-brand-orange via-brand-orange to-brand-blue md:left-1/2" />
      {children}
    </div>
  );
}

/** Endless horizontal ticker. Pauses on hover; stops entirely for reduced motion (CSS). */
export function Marquee({ items, className }: { items: string[]; className?: string }) {
  const row = (hidden?: boolean) => (
    <ul aria-hidden={hidden} className="flex shrink-0 items-center gap-10 pr-10">
      {items.map((item) => (
        <li key={item} className="flex items-center gap-10 whitespace-nowrap">
          {item}
          <span aria-hidden className="text-brand-orange">
            ✦
          </span>
        </li>
      ))}
    </ul>
  );
  return (
    <div className={cn("group flex overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]", className)}>
      <div className="flex animate-[marquee_38s_linear_infinite] group-hover:[animation-play-state:paused] motion-reduce:animate-none">
        {row()}
        {row(true)}
      </div>
    </div>
  );
}
