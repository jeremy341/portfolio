import type { APIRoute } from "astro";
import { getContent } from "../../lib/content";
import { langOf, langParams, ui, url } from "../../lib/i18n";
import { plainText } from "../../lib/markdown";
import { formatDate } from "../../lib/site";

export const getStaticPaths = langParams;

// The index the finder (src/scripts/finder.ts) searches. It is fetched when the finder first
// opens, so no page carries it. Each language has its own (/search.json, /de/search.json).
// Fields are short on purpose: k kind, t title, h href, m meta line, s summary, g tags,
// b the text to search that is not shown in the list.
export const GET: APIRoute = ({ params }) => {
  const lang = langOf(params.lang);
  const t = ui[lang];
  const { about, certificates, cv, posts, projects } = getContent(lang);
  const kinds = t.idxKinds;
  const pages = [
    { k: "page", t: t.idxHomeTitle, h: url(lang, "/"), m: kinds.index, s: t.idxHome, g: [], b: "" },
    { k: "page", t: t.workTitle, h: url(lang, "/work/"), m: kinds.projects, s: t.idxWork(projects.length), g: [], b: "" },
    { k: "page", t: t.writingTitle, h: url(lang, "/blog/"), m: kinds.articles, s: t.idxWriting(posts.length), g: [], b: "" },
    {
      k: "page",
      t: t.certificatesTitle,
      h: url(lang, "/certificates/"),
      m: kinds.certificates,
      s: t.idxCertificates(certificates.length),
      g: [],
      b: plainText(certificates.map((c) => `${c.title} ${c.issuer} ${c.kind} ${c.text}`).join(" ")),
    },
    { k: "page", t: t.aboutTitle, h: url(lang, "/about/"), m: kinds.profile, s: about.profile, g: [], b: plainText(about.biography) },
    { k: "page", t: t.contactTitle, h: url(lang, "/contact/"), m: kinds.profiles, s: t.idxContact, g: t.idxContactTags, b: "" },
    { k: "page", t: t.idxCvTitle, h: url(lang, "/cv/"), m: kinds.cv, s: cv.tagline, g: t.idxCvTags, b: plainText(cv.body) },
  ];
  const work = projects.map((p) => ({
    k: "project",
    t: p.name,
    h: url(lang, `/work/${p.slug}/`),
    m: `${p.status} / ${p.categoryLabel}`,
    s: p.summary,
    g: p.tech,
    b: plainText(`${p.context} ${p.inside} ${p.standing} ${p.facts.map((f) => `${f.label} ${f.value}`).join(" ")}`),
  }));
  const writing = posts.map((p) => ({
    k: "post",
    t: p.title,
    h: url(lang, `/blog/${p.slug}/`),
    m: `${formatDate(p.publishedAt, lang)} / ${t.minRead(p.minutes)}`,
    s: p.description,
    g: p.tags,
    b: p.text,
  }));
  return new Response(JSON.stringify([...pages, ...work, ...writing]), {
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
};
