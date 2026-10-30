import Image from "next/image";
import { Quote } from "lucide-react";
import { Reveal, Stagger, StaggerItem } from "@/components/landing/motion";

// Sample copy for review. Replace with approved student quotes before publishing. Portraits supplied by the user.
const TESTIMONIALS = [
  { initials: "01", name: "Scholarship applicant", topic: "Finding the right opportunity", quote: "I used to jump between websites trying to understand which scholarships suited me. Having the requirements and deadlines together made it much easier to decide where to start." },
  { initials: "02", name: "Korean language learner", topic: "Preparing with confidence", quote: "Learning Korean felt like a big step at first. Breaking it into smaller lessons helped me keep going and feel more confident about preparing for TOPIK." },
  { initials: "03", name: "Scholarship applicant", topic: "Getting the documents ready", quote: "The document checklist gave me a clear plan. Knowing what was ready and what still needed attention helped me feel more organised before submitting my application." },
  { initials: "04", name: "Course student", topic: "Support that feels close to home", quote: "Being able to pay with a familiar payment method made getting started easier. I liked having my learning and scholarship preparation in one place." },
];

export function Testimonials() {
  return (
    <section id="testimonials" aria-labelledby="testimonials-heading" className="scroll-mt-32 border-t border-slate-100 bg-white py-24 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="max-w-2xl">
          <p className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.2em] text-brand-blue"><span aria-hidden className="h-px w-8 bg-brand-blue" />Testimonials</p>
          <h2 id="testimonials-heading" className="mt-4 font-heading text-4xl font-extrabold leading-[1.05] tracking-[-0.03em] text-[#0f1b2d] sm:text-5xl">Every journey has a story.</h2>
          <p className="mt-5 text-sm leading-relaxed text-slate-500">Sample testimonials for review. These generated quotes are placeholders, not statements from the people pictured.</p>
        </Reveal>
        <Stagger className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {TESTIMONIALS.map((item) => (
            <StaggerItem key={item.initials} className="flex h-full flex-col rounded-3xl border border-slate-200 bg-[#f7f3ec]/60 p-6 sm:p-7">
              <div className="relative mb-6 aspect-[4/3] overflow-hidden rounded-2xl bg-slate-200">
                <Image src={`/images/testimonials/portrait-${item.initials}.png`} alt="" fill sizes="(min-width: 1280px) 240px, (min-width: 1024px) 22vw, (min-width: 640px) 44vw, 88vw" className="object-cover object-[50%_35%]" />
              </div>
              <div className="flex items-center justify-between gap-3"><Quote aria-hidden className="size-8 text-brand-orange" /><span className="rounded-full bg-white px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-wider text-slate-500">Draft sample</span></div>
              <p className="mt-6 text-xs font-bold uppercase tracking-wider text-brand-blue">{item.topic}</p>
              <blockquote className="mb-8 mt-3 flex-1 text-base leading-relaxed text-slate-700">&ldquo;{item.quote}&rdquo;</blockquote>
              <div className="flex items-center gap-3 border-t border-slate-200 pt-5">
                <div><p className="text-sm font-bold text-[#0f1b2d]">{item.name}</p><p className="mt-0.5 text-xs text-slate-500">Sample testimonial</p></div>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
