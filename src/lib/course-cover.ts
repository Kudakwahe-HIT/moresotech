// Plain data, safe to import from client and server components alike.

export const COVER_PREFIX = "course-covers/";
export const COVER_TYPES = ["image/jpeg", "image/png", "image/webp"];
/** Limit for what we store; the browser shrinks pictures to COVER_MAX_WIDTH first, so real files are far smaller. */
export const MAX_COVER_BYTES = 5 * 1024 * 1024;
export const COVER_MAX_WIDTH = 1600;

export function isCoverPath(value: string) {
  return value.startsWith(COVER_PREFIX) && /^[\w./-]+$/.test(value) && !value.includes("..");
}

/**
 * Public URL for a course's cover, or null when it has none. The file name (which has a random
 * suffix) is part of the URL, so a new picture gets a new URL and old copies can be cached forever.
 */
export function coverUrl(course: { id: string; coverImage: string | null }) {
  if (!course.coverImage) return null;
  const version = course.coverImage.split("/").pop() ?? "";
  return `/api/courses/${course.id}/cover?v=${encodeURIComponent(version)}`;
}
