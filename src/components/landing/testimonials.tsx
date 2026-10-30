"use client";

import { useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight, Quote } from "lucide-react";
import { Reveal } from "@/components/landing/motion";
import { cn } from "@/lib/utils";

// Generated sample quotes for review; these are not statements from the people pictured.
const TESTIMONIALS = [
  { initials: "01", name: "Scholarship applicant", topic: "Finding the right opportunity", quote: "I used to jump between websites trying to understand which scholarships suited me. Having the requirements and deadlines together made it much easier to decide where to start." },
  { initials: "02", name: "Korean language learner", topic: "Preparing with confidence", quote: "Learning Korean felt like a big step at first. Breaking it into smaller lessons helped me keep going and feel more confident about preparing for TOPIK." },
  { initials: "03", name: "Scholarship applicant", topic: "Getting the documents ready", quote: "The document checklist gave me a clear plan. Knowing what was ready and what still needed attention helped me feel more organised before submitting my application." },
  { initials: "04", name: "Course student", topic: "Support that feels close to home", quote: "Being able to pay with a familiar payment method made getting started easier. I liked having my learning and scholarship preparation in one place." },
];

const HEADLINES = [
  "A clearer path to my next chapter.",
  "Small steps. A little more confidence every day.",
  "From a pile of documents to a plan.",
  "A big ambition, with support close to home.",
];

export function Testimonials() {
  const [active, setActive] = useState(0);
  const reducedMotion = useReducedMotion();
  const item = TESTIMONIALS[active];
  const move = (step: number) => setActive((current) => (current + step + TESTIMONIALS.length) % TESTIMONIALS.length);

  return (
    <section id="testimonials" aria-labelledby="testimonials-heading" className="relative isolate scroll-mt-32 overflow-hidden bg-[#0f1b2d] py-20 text-white sm:py-28">
      <div aria-hidden className="pointer-events-none absolute -right-40 top-0 size-[38rem] rounded-full bg-brand-blue/20 blur-[100px]" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <p className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.24em] text-brand-orange"><span aria-hidden className="h-px w-10 bg-brand-orange" />The journey, in their words</p>
            <h2 id="testimonials-heading" className="mt-5 max-w-2xl font-heading text-4xl font-extrabold leading-[1.05] tracking-[-0.04em] sm:text-6xl">Big dreams.<br /><span className="text-white/45">Personal stories.</span></h2>
          </div>
          <p className="max-w-xs text-sm leading-relaxed text-slate-400">Every next step starts somewhere. Explore four perspectives on preparing for what comes next.</p>
        </Reveal>

        <div className="mt-12 overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.035] shadow-[0_35px_90px_-35px_rgba(0,0,0,0.6)] sm:mt-16">
          <div className="grid lg:grid-cols-[0.9fr_1.1fr]">
            <div className="relative bg-[#e5ded3] p-4 sm:p-6 lg:p-8">
              <div className="relative h-[25rem] sm:h-[32rem] lg:h-[36rem]">
                <AnimatePresence initial={false} mode="wait">
                  <motion.div key={item.initials} initial={{ opacity: 0, x: reducedMotion ? 0 : -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: reducedMotion ? 0 : 20 }} transition={{ duration: reducedMotion ? 0 : 0.35 }} className="absolute inset-0">
                    <Image src={`/images/testimonials/portrait-${item.initials}.png`} alt={`Portrait accompanying sample story ${active + 1}`} fill sizes="(min-width: 1280px) 480px, (min-width: 1024px) 40vw, 90vw" className="object-contain" />
                  </motion.div>
                </AnimatePresence>
              </div>
              <span className="absolute bottom-7 left-7 rounded-full border border-white/30 bg-[#0f1b2d]/85 px-4 py-2 text-[0.65rem] font-bold uppercase tracking-[0.18em] text-white backdrop-blur sm:bottom-9 sm:left-9">Story {item.initials} / 04</span>
            </div>

            <div className="flex min-w-0 flex-col justify-between p-7 sm:p-10 lg:p-12">
              <div className="flex items-center justify-between gap-4">
                <Quote aria-hidden className="size-11 text-brand-orange" strokeWidth={1.2} />
                <span className="rounded-full border border-white/15 px-3 py-1.5 text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-slate-400">Draft testimonial</span>
              </div>
              <div aria-live="polite" aria-atomic="true" className="my-9">
                <AnimatePresence initial={false} mode="wait">
                  <motion.div key={item.initials} initial={{ opacity: 0, y: reducedMotion ? 0 : 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: reducedMotion ? 0 : -12 }} transition={{ duration: reducedMotion ? 0 : 0.3 }}>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-orange">{item.topic}</p>
                    <h3 className="mt-5 font-heading text-3xl font-bold leading-[1.15] tracking-[-0.03em] sm:text-4xl">{HEADLINES[active]}</h3>
                    <blockquote className="mt-6 text-base leading-[1.85] text-slate-300 sm:text-lg">&ldquo;{item.quote}&rdquo;</blockquote>
                    <p className="mt-7 text-sm font-semibold text-white">{item.name}<span className="ml-3 font-normal text-slate-500">Sample story {item.initials}</span></p>
                  </motion.div>
                </AnimatePresence>
              </div>
              <div className="flex items-center justify-between gap-5 border-t border-white/10 pt-6">
                <div className="flex gap-2" aria-label="Story progress">
                  {TESTIMONIALS.map((story, index) => <span key={story.initials} className={cn("h-1 rounded-full transition-all duration-500 motion-reduce:transition-none", index === active ? "w-10 bg-brand-orange" : "w-4 bg-white/20")} />)}
                </div>
                <div className="flex gap-2">
                  <button type="button" onClick={() => move(-1)} aria-label="Previous testimonial" className="flex size-12 items-center justify-center rounded-full border border-white/20 transition hover:-translate-x-1 hover:border-brand-orange hover:bg-brand-orange hover:text-[#0f1b2d] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-orange motion-reduce:transform-none"><ArrowLeft className="size-5" /></button>
                  <button type="button" onClick={() => move(1)} aria-label="Next testimonial" className="flex size-12 items-center justify-center rounded-full border border-white/20 transition hover:translate-x-1 hover:border-brand-orange hover:bg-brand-orange hover:text-[#0f1b2d] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-orange motion-reduce:transform-none"><ArrowRight className="size-5" /></button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div aria-label="Choose a testimonial" className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {TESTIMONIALS.map((story, index) => (
            <motion.button key={story.initials} type="button" onClick={() => setActive(index)} aria-pressed={active === index} whileHover={reducedMotion ? undefined : { y: -4 }} whileTap={reducedMotion ? undefined : { scale: 0.98 }} className={cn("group relative flex min-w-0 items-center gap-3 rounded-2xl border p-3 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-orange sm:p-4", active === index ? "border-brand-orange/60 bg-brand-orange/10" : "border-white/10 bg-white/[0.025] hover:border-white/30 hover:bg-white/[0.06]")}>
              <div className="relative h-16 w-12 shrink-0 overflow-hidden rounded-lg bg-[#e5ded3]"><Image src={`/images/testimonials/portrait-${story.initials}.png`} alt="" fill sizes="48px" className="object-contain" /></div>
              <div className="min-w-0"><span className={cn("text-[0.6rem] font-bold uppercase tracking-[0.16em]", active === index ? "text-brand-orange" : "text-slate-500")}>Story {story.initials}</span><span className="mt-1 block text-xs font-semibold leading-relaxed text-slate-200 sm:text-sm">{story.topic}</span></div>
            </motion.button>
          ))}
        </div>
        <p className="mt-7 max-w-2xl text-xs leading-relaxed text-slate-500">Draft content for review. These generated quotes are placeholders, not statements from the people pictured.</p>
      </div>
    </section>
  );
}
