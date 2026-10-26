import { sections, ui, url, type Lang } from "./i18n";

export const site = {
  name: "Jeremy Darko",
  fullName: "Jeremy Yeboah Darko",
};

/** The sections, in the language of the page. */
export function navFor(lang: Lang) {
  const t = ui[lang].nav;
  return sections.map(({ id, path }) => ({ href: url(lang, path), label: t[id] }));
}

/** Canonical URL, only when the build knows its public origin. */
export function canonical(path: string): string | undefined {
  const origin = import.meta.env.SITE;
  return origin ? new URL(path, origin).toString() : undefined;
}

const dateFormats = {
  en: new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }),
  de: new Intl.DateTimeFormat("de-DE", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }),
};

export function formatDate(date: Date, lang: Lang = "en"): string {
  return dateFormats[lang].format(date);
}

export function isoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}
