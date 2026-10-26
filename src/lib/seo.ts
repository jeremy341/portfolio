// Structured data for search engines and AI answer engines. Every value comes from the content files
// or from i18n, so the profile links here are the ones on the Contact page. Without a public origin
// the absolute addresses are left out, because JSON-LD and breadcrumbs need them.
import { getContent } from "./content";
import { ui, url, type Lang } from "./i18n";
import { canonical, site } from "./site";

/** The public profiles from the Contact page: the only ones the site presents as the person's. */
export function profilesOf(lang: Lang): string[] {
  return getContent(lang).contact.profiles.map((row) => row.href);
}

/** The person as a reference, for the author or publisher of a page. */
export function personRef(lang: Lang) {
  return { "@type": "Person", name: site.name, url: canonical(url(lang, "/")) };
}

/** The person in full. The About page carries it; the other pages refer to it by name. */
export function personNode(lang: Lang) {
  const { about, contact } = getContent(lang);
  const t = ui[lang];
  const email = contact.direct.find((row) => row.href.startsWith("mailto:"));
  return {
    "@type": "Person",
    name: site.name,
    alternateName: site.fullName,
    jobTitle: t.jobTitle,
    description: t.personDescription(site.name),
    url: canonical(url(lang, "/")),
    email: email?.href.slice("mailto:".length),
    address: { "@type": "PostalAddress", addressRegion: t.region, addressCountry: "DE" },
    knowsAbout: about.topics
      .split("\n")
      .filter((line) => line.startsWith("- "))
      .map((line) => line.slice(2).trim()),
    sameAs: profilesOf(lang),
  };
}

/** The site itself, with its owner as author. */
export function websiteNode(lang: Lang) {
  const t = ui[lang];
  return {
    "@type": "WebSite",
    name: site.name,
    description: t.description,
    url: canonical(url(lang, "/")),
    inLanguage: t.htmlLang,
    author: personRef(lang),
  };
}

/** The trail from the home page to this page, for search results. */
export function breadcrumbs(lang: Lang, trail: { name: string; path: string }[]) {
  if (!canonical("/")) return undefined;
  const items = [{ name: ui[lang].idxHomeTitle, path: url(lang, "/") }, ...trail];
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: canonical(item.path),
    })),
  };
}
