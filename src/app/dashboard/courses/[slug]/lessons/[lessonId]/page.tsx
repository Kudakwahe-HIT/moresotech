import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, CheckCircle2, ExternalLink, Lock, PlayCircle } from "lucide-react";
import { CompleteLessonButton } from "@/components/learning/buttons";
import { requireRole } from "@/lib/auth";
import { getCourseForStudent } from "@/lib/courses";
import { formatDuration, hasCourseAccess, videoEmbed } from "@/lib/learning-rules";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Lesson | MoreSo Tech",
};

export default async function LessonPage({ params }: PageProps<"/dashboard/courses/[slug]/lessons/[lessonId]">) {
  const { slug, lessonId } = await params;
  const profile = await requireRole("student");
  const data = await getCourseForStudent(slug, profile.id);
  if (!data) notFound();

  const index = data.lessons.findIndex((l) => l.id === lessonId);
  if (index === -1) notFound();
  const lesson = data.lessons[index];
  const access = hasCourseAccess(data.enrollment?.status);
  // Locked lessons send people back to the course page to enroll.
  if (!access && !lesson.freePreview) redirect(`/dashboard/courses/${slug}`);

  const next = data.lessons[index + 1];
  const video = videoEmbed(lesson.videoUrl);
  const done = data.completedIds.has(lesson.id);

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
      <div className="min-w-0 space-y-5">
        <Link href={`/dashboard/courses/${slug}`} className="group inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-900">
          <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-0.5" /> {data.course.title}
        </Link>

        {video?.kind === "embed" ? (
          <div className="aspect-video overflow-hidden rounded-3xl bg-slate-900 shadow-[0_16px_40px_-16px_rgba(15,23,42,0.4)]">
            <iframe
              src={video.src}
              title={lesson.title}
              className="size-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              referrerPolicy="strict-origin-when-cross-origin"
            />
          </div>
        ) : video?.kind === "link" ? (
          <a href={video.src} target="_blank" rel="noopener noreferrer" className="flex aspect-video flex-col items-center justify-center gap-3 rounded-3xl bg-[#0f1b2d] text-white transition hover:bg-[#1a2a42]">
            <PlayCircle className="size-14 text-brand-orange" />
            <span className="inline-flex items-center gap-1.5 text-sm font-semibold">
              Open the lesson video <ExternalLink className="size-4" />
            </span>
          </a>
        ) : null}

        <article className="rounded-3xl bg-white p-6 shadow-[0_1px_3px_rgba(15,23,42,0.04)] sm:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-brand-orange-dark">
            Lesson {index + 1} of {data.lessons.length}
            {lesson.durationMinutes ? ` · ${formatDuration(lesson.durationMinutes)}` : ""}
          </p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">{lesson.title}</h2>
          {lesson.summary && <p className="mt-2 text-slate-500">{lesson.summary}</p>}
          {lesson.content && <div className="mt-6 whitespace-pre-line text-[0.95rem] leading-relaxed text-slate-700">{lesson.content}</div>}

          <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-6">
            {access ? (
              <CompleteLessonButton lessonId={lesson.id} done={done} nextHref={next ? `/dashboard/courses/${slug}/lessons/${next.id}` : null} />
            ) : (
              <Link href={`/dashboard/courses/${slug}`} className="inline-flex h-11 items-center gap-2 rounded-xl bg-brand-orange px-5 text-sm font-semibold text-white transition hover:bg-brand-orange-dark">
                Enroll to continue
              </Link>
            )}
            {done && <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-600"><CheckCircle2 className="size-4" /> Completed</span>}
          </div>
        </article>
      </div>

      <aside className="overflow-hidden rounded-3xl bg-white shadow-[0_1px_3px_rgba(15,23,42,0.04)] xl:sticky xl:top-6 xl:self-start">
        <div className="px-5 pb-3 pt-5">
          <h3 className="font-bold text-slate-900">Course content</h3>
          {access && (
            <p className="mt-0.5 text-xs text-slate-500">
              {data.completedIds.size}/{data.lessons.length} complete · {data.percent}%
            </p>
          )}
        </div>
        <ol className="max-h-[60dvh] overflow-y-auto pb-2">
          {data.lessons.map((l, i) => {
            const open = access || l.freePreview;
            const current = l.id === lesson.id;
            const isDone = data.completedIds.has(l.id);
            const inner = (
              <>
                <span className={cn("flex size-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold", isDone ? "bg-emerald-500 text-white" : current ? "bg-brand-orange text-white" : "bg-slate-100 text-slate-500")}>
                  {isDone ? <CheckCircle2 className="size-3.5" /> : open ? i + 1 : <Lock className="size-3.5" />}
                </span>
                <span className={cn("min-w-0 flex-1 truncate text-sm", current ? "font-bold text-slate-900" : "text-slate-600")}>{l.title}</span>
              </>
            );
            return (
              <li key={l.id}>
                {open ? (
                  <Link href={`/dashboard/courses/${slug}/lessons/${l.id}`} aria-current={current ? "page" : undefined} className={cn("flex items-center gap-3 px-5 py-2.5 transition hover:bg-slate-50", current && "bg-brand-orange/5")}>
                    {inner}
                  </Link>
                ) : (
                  <div className="flex items-center gap-3 px-5 py-2.5 opacity-70">{inner}</div>
                )}
              </li>
            );
          })}
        </ol>
      </aside>
    </div>
  );
}
