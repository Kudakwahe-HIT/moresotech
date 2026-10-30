"use client";

import { useState } from "react";
import Image from "next/image";
import { Pause, Play, Quote } from "lucide-react";
import { Reveal } from "@/components/landing/motion";

const TESTIMONIALS = [
  { initials: "01", name: "Scholarship applicant", topic: "Finding the right opportunity", quote: "I used to jump between websites trying to understand which scholarships suited me. Having the requirements and deadlines together made it much easier to decide where to start." },
  { initials: "02", name: "Korean language learner", topic: "Preparing with confidence", quote: "Learning Korean felt like a big step at first. Breaking it into smaller lessons helped me keep going and feel more confident about preparing for TOPIK." },
  { initials: "03", name: "Scholarship applicant", topic: "Getting the documents ready", quote: "The document checklist gave me a clear plan. Knowing what was ready and what still needed attention helped me feel more organised before submitting my application." },
  { initials: "04", name: "Course student", topic: "Support that feels close to home", quote: "Being able to pay with a familiar payment method made getting started easier. I liked having my learning and scholarship preparation in one place." },
];

export function Testimonials() {
  const [paused, setPaused] = useState(false);

  const cards = (duplicate = false) => (
    <ul aria-hidden={duplicate || undefined} className="flex shrink-0 items-stretch gap-5 pr-5">
      {TESTIMONIALS.map((item) => (
        <li key={item.initials} className="testimonial-item shrink-0 pb-3 pt-3">
          <figure className="relative flex h-full min-h-[22rem] flex-col rounded-2xl bg-[#faf9ff] px-6 pb-28 pt-6 transition-transform duration-300 hover:-translate-y-1 motion-reduce:transform-none sm:px-7">
            <Quote aria-hidden className="size-8 fill-slate-200/60 text-slate-200/80" strokeWidth={1.3} />
            <blockquote className="mt-5 flex-1 text-[0.95rem] leading-[1.75] text-slate-600">&ldquo;{item.quote}&rdquo;</blockquote>
            <figcaption className="testimonial-signature absolute bottom-0 left-0 flex w-[84%] items-center gap-3 rounded-tr-2xl bg-[#e3e4e8] pb-1 pr-3 pt-3">
              <div className="relative h-16 w-12 shrink-0 overflow-hidden rounded-full bg-[#e7e1d8]">
                <Image src={`/images/testimonials/portrait-${item.initials}.png`} alt="" fill sizes="48px" className="object-contain" />
              </div>
              <div><p className="text-xs font-bold text-[#0f1b2d]">{item.name}</p><p className="mt-1 text-[0.6rem] text-slate-500">MoreSo Tech community</p></div>
            </figcaption>
          </figure>
        </li>
      ))}
    </ul>
  );

  return (
    <section id="testimonials" aria-labelledby="testimonials-heading" className="scroll-mt-32 overflow-hidden bg-[#e3e4e8] py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="text-center">
          <h2 id="testimonials-heading" className="font-heading text-3xl font-extrabold leading-[1.1] tracking-[-0.03em] text-[#0f1b2d] sm:text-5xl">Student <span className="text-brand-orange">Testimonials</span></h2>
        </Reveal>

      <div role="region" aria-label="Student testimonials" tabIndex={0} className="testimonial-marquee mt-10 overflow-x-auto py-4 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-brand-orange sm:mt-14" data-paused={paused}>
        <div className="testimonial-track flex w-max items-stretch">
          {cards()}
          {cards(true)}
        </div>
      </div>

      <div className="mx-auto mt-6 flex max-w-7xl items-center justify-center gap-5 px-4">
        <span aria-hidden className="flex gap-1.5"><span className="size-2 rounded-full bg-slate-400/50" /><span className="size-2 rounded-full bg-brand-orange" /><span className="size-2 rounded-full bg-slate-400/50" /></span>
        <button type="button" onClick={() => setPaused((value) => !value)} aria-pressed={paused} className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white/70 px-4 py-2 text-xs font-semibold text-slate-600 transition hover:border-brand-orange hover:text-brand-orange-dark focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-orange">
          {paused ? <Play aria-hidden className="size-3.5" /> : <Pause aria-hidden className="size-3.5" />}
          {paused ? "Resume stories" : "Pause stories"}
        </button>
      </div>
      </div>
    </section>
  );
}
