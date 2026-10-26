import { getContent } from "./content";
import { ui, type Lang } from "./i18n";

/** The short line shown beside each of the sections on the home pages. */
export function homeDetail(lang: Lang): string[] {
  const { certificates, projects, posts } = getContent(lang);
  return ui[lang].homeDetail(projects.length, posts.length, certificates.length);
}

/** The key that opens each section from a home page. */
export const homeKeys = (lang: Lang) => ui[lang].homeKeys;
