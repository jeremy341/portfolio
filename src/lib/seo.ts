// Structured data for search engines and AI answer engines. Every value comes from the content files
// or from i18n, so the profile links here are the ones on the Contact page. Without a public origin
// the absolute addresses are left out, because JSON-LD and breadcrumbs need them.
import { getContent, type Project } from "./content";
import { ui, url, type Lang } from "./i18n";
import { plainText } from "./markdown";
import { canonical, site } from "./site";

/** The public profiles from the Contact page: the only ones the site presents as the person's. */
export function profilesOf(lang: Lang): string[] {
  return getContent(lang).contact.profiles.map((row) => row.href);
}

/** The person as a reference, for the author or publisher of a page. */
export function personRef(lang: Lang) {
  return { "@type": "Person", "@id": canonical("/#person"), name: site.name, url: canonical(url(lang, "/about/")) };
}

/** The person in full. The About page carries it; the other pages refer to it by name. */
export function personNode(lang: Lang) {
  const { about, contact } = getContent(lang);
  const t = ui[lang];
  const email = contact.direct.find((row) => row.href.startsWith("mailto:"));
  return {
    "@type": "Person",
    "@id": canonical("/#person"),
    name: site.name,
    alternateName: site.fullName,
    jobTitle: t.jobTitle,
    description: t.personDescription(site.name),
    url: canonical(url(lang, "/about/")),
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
    "@id": canonical("/#website"),
    name: site.name,
    description: t.description,
    url: canonical("/"),
    inLanguage: ["en", "de"],
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

/** English questions and answers for llms.txt, based on the site's own pages. */
export function faqEntries(): { question: string; answer: string }[] {
  const { projects } = getContent("en");
  const downloads = projects.find((p) => p.slug === "mira")?.facts.find((f) => f.label === "Downloads")?.value;
  const summaryOf = (slug: string) => projects.find((p: Project) => p.slug === slug)?.summary ?? "";
  const qa: [string, string][] = [
    ["Who is Jeremy Darko?", `${site.fullName} is a student from North Rhine-Westphalia, Germany, who builds computer engineering and machine learning projects. Projects, articles and certificates are on this site.`],
    ["What is MIRA?", `MIRA (Machine Intelligence for Recycling Automation) is a computer vision project that tries to tell kinds of waste apart with a camera and a small model. It is an experiment, not a finished sorting robot.${downloads ? ` Its public number is ${plainText(downloads)}.` : ""}`],
    ["Is MIRA finished?", "No. The sorting robot is unfinished. There is no measured Raspberry Pi deployment result for the final detector, and no verified EXP-020 result is reported."],
    ["What is Poorup?", summaryOf("poorup")],
    ["What is FluidicStudio?", summaryOf("fluidicstudio")],
    ["Does Jeremy work at the University of Duisburg-Essen?", "Not in a university role. He does project work with the Chair of Electronic Components and Circuits (EBS), and he spent four weeks at the chair from 3 to 28 August 2026 on FluidicStudio."],
  ];
  return qa.map(([question, answer]) => ({ question, answer }));
}
