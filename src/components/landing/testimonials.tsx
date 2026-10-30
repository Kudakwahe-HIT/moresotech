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
    <ul aria-hidden={duplicate || undefined} className="flex shrink-0 items-stretch gap-6 pr-6">
      {TESTIMONIALS.map((item) => (
        <li key={item.initials} className="w-[min(82vw,24rem)] shrink-0 pb-3 pt-3">
          <figure className="group/card relative flex h-full flex-col rounded-[1.75rem] border border-white/90 bg-white p-6 shadow-[0_12px_35px_-20px_rgba(15,27,45,0.25)] transition duration-300 hover:-translate-y-2 hover:shadow-[0_22px_45px_-20px_rgba(15,27,45,0.3)] motion-reduce:transform-none sm:p-8">
            <Quote aria-hidden className="size-9 fill-brand-orange/15 text-brand-orange" strokeWidth={1.3} />
            <p className="mt-5 text-xs font-bold uppercase tracking-[0.14em] text-brand-blue">{item.topic}</p>
            <blockquote className="mb-8 mt-4 flex-1 text-base leading-[1.85] text-slate-600">&ldquo;{item.quote}&rdquo;</blockquote>
            <figcaption className="flex items-center gap-4 border-t border-slate-100 pt-5">
              <div className="relative h-24 w-[4.5rem] shrink-0 overflow-hidden rounded-2xl bg-[#e7e1d8] ring-4 ring-[#f7f3ec]">
                <Image src={`/images/testimonials/portrait-${item.initials}.png`} alt="" fill sizes="72px" className="object-contain" />
              </div>
              <div><p className="text-sm font-bold text-[#0f1b2d]">{item.name}</p><p className="mt-1 text-xs text-slate-500">MoreSo Tech community</p></div>
            </figcaption>
          </figure>
        </li>
      ))}
    </ul>
  );

  return (
    <section id="testimonials" aria-labelledby="testimonials-heading" className="scroll-mt-32 overflow-hidden bg-[#eeeff2] py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="text-center">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-brand-blue">Our community</p>
          <h2 id="testimonials-heading" className="mt-4 font-heading text-4xl font-extrabold leading-[1.1] tracking-[-0.04em] text-[#0f1b2d] sm:text-6xl">Their journeys.<br className="sm:hidden" /> <span className="text-brand-orange">Their words.</span></h2>
          <p className="mx-auto mt-5 max-w-lg text-base leading-relaxed text-slate-500">The people taking their next step with MoreSo Tech.</p>
        </Reveal>
      </div>

      <div role="region" aria-label="Student testimonials" tabIndex={0} className="testimonial-marquee mt-10 overflow-x-auto py-4 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-brand-orange sm:mt-14" data-paused={paused}>
        <div className="testimonial-track flex w-max items-stretch">
          {cards()}
          {cards(true)}
        </div>
      </div>

      <div className="mx-auto mt-6 flex max-w-7xl items-center justify-center gap-5 px-4">
        <span aria-hidden className="h-px w-12 bg-slate-300" />
        <button type="button" onClick={() => setPaused((value) => !value)} aria-pressed={paused} className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white/70 px-4 py-2 text-xs font-semibold text-slate-600 transition hover:border-brand-orange hover:text-brand-orange-dark focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-orange">
          {paused ? <Play aria-hidden className="size-3.5" /> : <Pause aria-hidden className="size-3.5" />}
          {paused ? "Resume stories" : "Pause stories"}
        </button>
        <span aria-hidden className="h-px w-12 bg-slate-300" />
      </div>
    </section>
  );
}
