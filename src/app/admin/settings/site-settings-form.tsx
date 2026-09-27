"use client";

import { startTransition, useActionState, useEffect, useRef, useState, type FormEvent } from "react";
import { CircleAlert, ImageIcon, LoaderCircle, Megaphone, Save, Headset } from "lucide-react";
import { toast } from "sonner";
import { CoverImageInput } from "@/components/forms/cover-image-input";
import { Switch } from "@/components/forms/switch";
import { AnnouncementBar } from "@/components/shell/announcement-bar";
import type { SiteSettings } from "@/db/schema";
import { SITE_PREFIX } from "@/lib/course-cover";
import { siteHeroUrl } from "@/lib/settings-rules";
import type { FormState } from "@/lib/validation/learning";
import type { SiteSettingsValues } from "@/lib/validation/settings";
import { input } from "@/app/admin/courses/course-form";
import { Field } from "@/app/dashboard/settings/settings-forms";
import { saveSiteSettings } from "./actions";

/** Platform settings: support contact, announcement banner and the landing page hero picture. */
export function SiteSettingsForm({ site }: { site: SiteSettings }) {
  const [state, formAction, pending] = useActionState<FormState<SiteSettingsValues>, FormData>(saveSiteSettings, { status: "idle" });
  const errors = state.fieldErrors ?? {};
  const lastState = useRef(state);
  const [announcementOn, setAnnouncementOn] = useState(site.announcementActive);
  const [text, setText] = useState(site.announcementText ?? "");
  const [link, setLink] = useState(site.announcementLink ?? "");

  useEffect(() => {
    if (state !== lastState.current && state.message === "saved") toast.success("Settings saved", { description: "Changes are live across the site." });
    lastState.current = state;
  }, [state]);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    startTransition(() => formAction(data));
  }

  return (
    <form noValidate onSubmit={onSubmit} className="space-y-6 pb-24">
      {state.status === "error" && state.message && (
        <div role="alert" className="flex items-center gap-2.5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          <CircleAlert className="size-4 shrink-0" /> {state.message}
        </div>
      )}

      <Card id="support" icon={Headset} title="Support contact" description="Shown to students in Settings → Help, on the landing page footer, and when an account can't be deleted.">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Support email" error={errors.supportEmail}>
            <input name="supportEmail" type="email" defaultValue={site.supportEmail ?? ""} placeholder="e.g. help@moresotech.com" className={input(errors.supportEmail)} />
          </Field>
          <Field label="WhatsApp number" hint="With country code" error={errors.supportWhatsapp}>
            <input name="supportWhatsapp" type="tel" defaultValue={site.supportWhatsapp ?? ""} placeholder="+263 77 123 4567" className={input(errors.supportWhatsapp)} />
          </Field>
        </div>
      </Card>

      <Card id="announcement" icon={Megaphone} title="Announcement banner" description="A short message across the top of every student's dashboard and the landing page.">
        <div className="space-y-5">
          <div className="flex items-center justify-between gap-4 rounded-2xl bg-slate-50 px-4 py-3">
            <div>
              <p id="announcement-switch" className="text-sm font-semibold text-slate-900">
                Show the banner
              </p>
              <p className="text-xs text-slate-500">Switch off to hide it without losing the text.</p>
            </div>
            <Switch name="announcementActive" checked={announcementOn} onCheckedChange={setAnnouncementOn} aria-labelledby="announcement-switch" />
          </div>
          <Field label="Message" hint={`${text.length}/180`} error={errors.announcementText}>
            <input
              name="announcementText"
              value={text}
              onChange={(e) => setText(e.target.value)}
              maxLength={180}
              placeholder="e.g. GKS 2027 applications are open. Deadline 30 March."
              className={input(errors.announcementText)}
            />
          </Field>
          <Field label="Link" hint="Optional: a page path or full https:// link" error={errors.announcementLink}>
            <input
              name="announcementLink"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder="e.g. /dashboard/scholarships"
              className={input(errors.announcementLink)}
            />
          </Field>
          {text && (
            <div>
              <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400">Preview{announcementOn ? "" : " (hidden)"}</p>
              <div className={announcementOn ? "" : "opacity-50"}>
                <AnnouncementBar text={text} link={link || null} preview />
              </div>
            </div>
          )}
        </div>
      </Card>

      <Card id="landing" icon={ImageIcon} title="Landing page picture" description="The large picture beside the headline on the home page. Without one, the first course with a cover picture is used.">
        <CoverImageInput
          name="heroImage"
          label="Hero picture"
          hint="Landscape, at least 1600px wide"
          prefix={SITE_PREFIX}
          defaultPath={site.heroImage}
          defaultUrl={siteHeroUrl(site.heroImage)}
          error={errors.heroImage}
        />
      </Card>

      <div data-settings-savebar className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/90 px-4 py-3 backdrop-blur-md lg:left-[296px]">
        <div className="mx-auto flex max-w-5xl items-center justify-end gap-2">
          <button type="submit" disabled={pending} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-brand-orange px-5 max-lg:w-full text-sm font-semibold text-white shadow-[0_8px_20px_-8px_rgba(245,130,32,0.6)] transition hover:bg-brand-orange-dark disabled:opacity-70">
            {pending ? <LoaderCircle className="size-4 animate-spin" /> : <Save className="size-4" />} Save settings
          </button>
        </div>
      </div>
    </form>
  );
}

function Card({ id, icon: Icon, title, description, children }: { id: string; icon: typeof Headset; title: string; description: string; children: React.ReactNode }) {
  // Same look and phone behaviour as SettingsSection (a server component, so it can't be used here).
  return (
    <section id={id} data-settings-section className="scroll-mt-6 rounded-2xl bg-white p-5 shadow-[0_1px_3px_rgba(15,23,42,0.04)] sm:p-7 lg:rounded-3xl">
      <div className="flex items-start gap-3.5">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-blue/10 text-brand-blue max-lg:hidden">
          <Icon className="size-5" />
        </span>
        <div>
          <h3 className="text-base font-bold text-slate-900 max-lg:hidden">{title}</h3>
          <p className="text-sm text-slate-500 lg:mt-0.5">{description}</p>
        </div>
      </div>
      <div className="mt-5 lg:mt-6">{children}</div>
    </section>
  );
}
