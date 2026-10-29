import type { ImageMetadata } from "astro";
import { load as loadYaml } from "js-yaml";
import { sections as siteSections, ui, url, type Lang } from "./i18n";
import { plainText, renderInline, renderMarkdown, resolveContentLink } from "./markdown";

// Everything the site shows comes from the Markdown files in /content: English at the top
// level, German in /content/de with the same file names.
const files = import.meta.glob<string>("/content/**/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
});

// The pictures the Markdown files point at (work/mira/detector-history.en.png and so on).
const pictures = import.meta.glob<{ default: ImageMetadata }>("/src/assets/**/*.{png,jpg,jpeg,webp}", { eager: true });

/** A picture named in a content file, relative to src/assets. */
function picture(path: string): ImageMetadata {
  const found = pictures[`/src/assets/${path}`];
  if (!found) throw new Error(`Missing picture: src/assets/${path}`);
  return found.default;
}

function file(lang: Lang, path: string): string {
  const full = lang === "de" ? `/content/de/${path}` : `/content/${path}`;
  const source = files[full];
  if (source === undefined) throw new Error(`Missing content file: ${full.slice(1)}`);
  return source.replace(/\r\n/g, "\n");
}

/** Splits a document into its "## " sections, keyed by heading text. */
function sections(source: string): Map<string, string> {
  const map = new Map<string, string>();
  const parts = source.split(/^## /m).slice(1);
  for (const part of parts) {
    const newline = part.indexOf("\n");
    map.set(part.slice(0, newline).trim(), part.slice(newline + 1).trim());
  }
  return map;
}

function section(map: Map<string, string>, heading: string): string {
  const value = map.get(heading);
  if (value === undefined) throw new Error(`Missing "## ${heading}" section`);
  return value;
}

/** Reads "- Label: value" bullets. */
function field(source: string, label: string): string {
  const match = source.match(new RegExp(`^- ${label}: (.+)$`, "m"));
  if (!match) throw new Error(`Missing "${label}" field`);
  return match[1].trim();
}

function links(source: string): { label: string; href: string }[] {
  return [...source.matchAll(/^- \[([^\]]+)\]\(([^)]+)\)/gm)].map(([, label, href]) => ({ label, href }));
}

/* What the files call their parts, per language. */

const names = {
  en: {
    id: "Original content ID",
    category: "Category",
    status: "Status",
    tech: "Technologies and topics",
    summary: "Summary",
    context: "Context and motivation",
    inside: "Inside the project",
    facts: "In numbers",
    figures: "Figures",
    standing: "Where it stands",
    links: "Links",
    source: /source repository/i,
    package: /pypi|package/i,
    certificate: { issuer: "Issued by", kind: "Kind", date: "Date", reference: "Reference", verify: "Verify", image: "Image", alt: "Image description" },
    about: { profile: "Short profile", biography: "Biography", ude: "Project work with UDE", community: "Community and internships", topics: "What I keep exploring", facts: "Fun facts", mira: "MIRA in public", profiles: "Public profiles" },
    contact: { direct: "Direct", profiles: "Approved public profiles" },
    categories: { systems: "Systems & compute", ml: "Machine learning", hardware: "Hardware & embedded", games: "Games & software" },
  },
  de: {
    id: "Ursprüngliche Inhalts-ID",
    category: "Kategorie",
    status: "Status",
    tech: "Technologien und Themen",
    summary: "Zusammenfassung",
    context: "Kontext und Motivation",
    inside: "Im Projekt",
    facts: "In Zahlen",
    figures: "Abbildungen",
    standing: "Aktueller Stand",
    links: "Links",
    source: /quellcode-repository/i,
    package: /pypi|paket/i,
    certificate: { issuer: "Ausgestellt von", kind: "Art", date: "Datum", reference: "Kennung", verify: "Prüfen", image: "Bild", alt: "Bildbeschreibung" },
    about: { profile: "Kurzprofil", biography: "Biografie", ude: "Projektarbeit mit der UDE", community: "Community und Praktika", topics: "Was ich weiter erkunde", facts: "Ein paar Fakten", mira: "MIRA in der Öffentlichkeit", profiles: "Öffentliche Profile" },
    contact: { direct: "Direkt", profiles: "Öffentliche Profile" },
    categories: { systems: "Systeme & Rechnen", ml: "Maschinelles Lernen", hardware: "Hardware & Embedded", games: "Spiele & Software" },
  },
} as const;

/* Projects */

export type CategoryId = "systems" | "ml" | "hardware" | "games";
const categoryIds: CategoryId[] = ["systems", "ml", "hardware", "games"];

export type LinkKind = "source" | "site" | "demo" | "models" | "package" | "article";

export interface ProjectLink {
  kind: LinkKind;
  label: string;
  href: string;
}

/** A picture on a project page, with the words that describe it. */
export interface Figure {
  src: ImageMetadata;
  /** The same chart drawn for the light theme, when one exists. */
  light?: ImageMetadata;
  alt: string;
  caption: string;
}

/** One row of "In numbers": a label and its value (inline Markdown). */
export interface Fact {
  label: string;
  value: string;
}

export interface Project {
  slug: string;
  legacyId: string;
  name: string;
  category: CategoryId;
  categoryLabel: string;
  status: string;
  tech: string[];
  summary: string;
  context: string;
  inside: string;
  standing: string;
  facts: Fact[];
  figures: Figure[];
  links: ProjectLink[];
  note?: string;
}

function linkKind(lang: Lang, label: string, href: string): LinkKind {
  const n = names[lang];
  if (href.endsWith(".md")) return "article";
  if (/hugging[ -]?face/i.test(label)) return "models";
  if (n.source.test(label)) return "source";
  if (n.package.test(label)) return "package";
  return /demo/i.test(label) ? "demo" : "site";
}

/** "- Label: value" rows. */
function facts(source: string | undefined): Fact[] {
  if (!source) return [];
  return [...source.matchAll(/^- ([^:\n]+): (.+)$/gm)].map(([, label, value]) => ({ label: label.trim(), value: value.trim() }));
}

/** "- ![description](project/file.png) Caption" rows; the path is relative to src/assets/work. */
function figures(source: string | undefined): Figure[] {
  if (!source) return [];
  return [...source.matchAll(/^- !\[([^\]]*)\]\(([^)]+)\)\s*(.*)$/gm)].map(([, alt, path, caption]) => ({
    src: picture(`work/${path.trim()}`),
    light: pictures[`/src/assets/work/${path.trim().replace(/\.(en|de)\.png$/, ".$1.light.png")}`]?.default,
    alt: alt.trim(),
    caption: caption.trim(),
  }));
}

function parseProject(lang: Lang, slug: string): Project {
  const n = names[lang];
  const source = file(lang, `projects/${slug}.md`);
  const map = sections(source);
  const categoryLabel = field(source, n.category);
  const category = categoryIds.find((id) => n.categories[id] === categoryLabel);
  if (!category) throw new Error(`Unknown category "${categoryLabel}" in ${lang}/${slug}`);
  const linkSection = section(map, n.links);
  const note = linkSection
    .split("\n")
    .filter((line) => line.trim() && !line.startsWith("- "))
    .join(" ")
    .trim();
  return {
    slug,
    legacyId: field(source, n.id),
    name: source.match(/^# (.+)$/m)![1].trim(),
    category,
    categoryLabel,
    status: field(source, n.status),
    tech: field(source, n.tech).split(",").map((t) => t.trim()),
    summary: section(map, n.summary),
    context: section(map, n.context),
    inside: section(map, n.inside),
    standing: section(map, n.standing),
    facts: facts(map.get(n.facts)),
    figures: figures(map.get(n.figures)),
    links: links(linkSection).map(({ label, href }) => {
      const kind = linkKind(lang, label, href);
      return { kind, label: ui[lang].linkLabel[kind], href: resolveContentLink(href, lang) };
    }),
    note: note || undefined,
  };
}

// The English index file keeps the canonical project order (both languages use it). MIRA leads
// because it is the project with public, measurable use.
const indexOrder = [...file("en", "projects/README.md").matchAll(/^- \[[^\]]+\]\(([\w-]+)\.md\)/gm)].map((m) => m[1]);
const lead = "mira";
const projectOrder = [lead, ...indexOrder.filter((slug) => slug !== lead)];

/* Posts */

export interface Post {
  slug: string;
  title: string;
  description: string;
  publishedAt: Date;
  updatedAt?: Date;
  tags: string[];
  html: string;
  text: string;
  markdown: string;
  minutes: number;
}

interface Frontmatter {
  title: string;
  description: string;
  slug: string;
  publishedAt: string | Date;
  updatedAt?: string | Date;
  tags?: string[];
  draft?: boolean;
}

function parsePost(lang: Lang, path: string): Post | undefined {
  const source = files[path].replace(/\r\n/g, "\n");
  const match = source.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) return undefined;
  const meta = loadYaml(match[1]) as Frontmatter;
  if (meta.draft) return undefined;
  const text = plainText(match[2]);
  const words = text.split(" ").length;
  return {
    slug: meta.slug,
    title: meta.title,
    description: meta.description,
    publishedAt: new Date(meta.publishedAt),
    updatedAt: meta.updatedAt ? new Date(meta.updatedAt) : undefined,
    tags: meta.tags ?? [],
    html: renderMarkdown(match[2], lang),
    text,
    markdown: match[2],
    minutes: Math.max(1, Math.round(words / 220)),
  };
}

function loadPosts(lang: Lang): Post[] {
  const dir = lang === "de" ? "/content/de/posts/" : "/content/posts/";
  return Object.keys(files)
    .filter((path) => path.startsWith(dir) && !path.endsWith("README.md"))
    .map((path) => parsePost(lang, path))
    .filter((post): post is Post => post !== undefined)
    .sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime() || a.title.localeCompare(b.title));
}

/* About and contact */

/** What a contact row shows beside its label: the address, the path, or the site's host. */
function where(href: string): string {
  if (href.startsWith("mailto:")) return href.slice("mailto:".length);
  if (href.startsWith("/")) return href;
  return new URL(href).host.replace(/^www\./, "");
}

function loadAbout(lang: Lang) {
  const n = names[lang].about;
  const map = sections(file(lang, "about.md"));
  return {
    profile: section(map, n.profile),
    biography: section(map, n.biography),
    ude: section(map, n.ude),
    community: section(map, n.community),
    topics: section(map, n.topics),
    facts: section(map, n.facts),
    mira: section(map, n.mira),
    profiles: section(map, n.profiles),
  };
}

function loadContact(lang: Lang) {
  const n = names[lang].contact;
  const source = file(lang, "contact.md");
  const map = sections(source);
  const rows = (heading: string) =>
    links(section(map, heading)).map(({ label, href }) => ({ label, href: resolveContentLink(href, lang), host: where(href) }));
  return {
    // The lines between the title and the first "## " heading.
    intro: source.split(/^## /m)[0].replace(/^# .+\n/, "").trim(),
    direct: rows(n.direct),
    profiles: rows(n.profiles),
  };
}

/* Certificates */

export interface Certificate {
  id: string;
  title: string;
  issuer: string;
  kind: string;
  date: string;
  reference?: string;
  verify?: { label: string; href: string };
  image?: { src: ImageMetadata; alt: string };
  text: string;
}

function optional(source: string, label: string): string | undefined {
  return source.match(new RegExp(`^- ${label}: (.+)$`, "m"))?.[1].trim();
}

function loadCertificates(lang: Lang) {
  const n = names[lang].certificate;
  const source = file(lang, "certificates.md");
  const [head, ...parts] = source.split(/^## /m);
  const list: Certificate[] = parts.map((part, i) => {
    const newline = part.indexOf("\n");
    const body = part.slice(newline + 1);
    const verify = optional(body, n.verify)?.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    const image = optional(body, n.image);
    // The fact lines at the top are read as fields; any other list is part of the text.
    const factLine = new RegExp(`^- (${Object.values(n).join("|")}): `);
    return {
      id: `cert-${i + 1}`,
      title: part.slice(0, newline).trim(),
      issuer: field(body, n.issuer),
      kind: field(body, n.kind),
      date: field(body, n.date),
      reference: optional(body, n.reference),
      verify: verify ? { label: verify[1], href: verify[2] } : undefined,
      image: image ? { src: picture(image), alt: field(body, n.alt) } : undefined,
      text: body
        .split("\n")
        .filter((line) => !factLine.test(line))
        .join("\n")
        .trim(),
    };
  });
  return { intro: head.replace(/^# .+\n/, "").trim(), list };
}

/* CV */

function loadCv(lang: Lang) {
  const source = file(lang, "cv.md");
  return {
    title: source.match(/^# (.+)$/m)![1].trim(),
    tagline: source.split(/^## /m)[0].replace(/^# .+\n/, "").trim(),
    body: "## " + source.split(/^## /m).slice(1).join("## "),
  };
}

/* Everything for one language, read once. */

export interface Content {
  lang: Lang;
  categories: { id: CategoryId; label: string }[];
  projects: Project[];
  posts: Post[];
  about: ReturnType<typeof loadAbout>;
  contact: ReturnType<typeof loadContact>;
  cv: ReturnType<typeof loadCv>;
  certificates: Certificate[];
  certificatesIntro: string;
}

const cache = new Map<Lang, Content>();

export function getContent(lang: Lang): Content {
  let content = cache.get(lang);
  if (!content) {
    const certificates = loadCertificates(lang);
    content = {
      lang,
      categories: categoryIds.map((id) => ({ id, label: names[lang].categories[id] })),
      projects: projectOrder.map((slug) => parseProject(lang, slug)),
      posts: loadPosts(lang),
      about: loadAbout(lang),
      contact: loadContact(lang),
      cv: loadCv(lang),
      certificates: certificates.list,
      certificatesIntro: certificates.intro,
    };
    cache.set(lang, content);
  }
  return content;
}

/** Every route the `:e` command and the finder can reach, as name and address. */
export function routesFor(lang: Lang) {
  const { projects, posts } = getContent(lang);
  return [
    { name: "index", href: url(lang, "/") },
    ...siteSections.map(({ path }) => ({ name: path.slice(1, -1), href: url(lang, path) })),
    { name: "cv", href: url(lang, "/cv/") },
    ...projects.map((p) => ({ name: `work/${p.slug}`, href: url(lang, `/work/${p.slug}/`) })),
    ...posts.map((p) => ({ name: `blog/${p.slug}`, href: url(lang, `/blog/${p.slug}/`) })),
  ];
}

export { renderInline, renderMarkdown };
