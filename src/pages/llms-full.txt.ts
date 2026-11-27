import type { APIRoute } from "astro";
import { getContent, type Post, type Project } from "../lib/content";
import { plainText } from "../lib/markdown";
import { canonical, isoDate, site } from "../lib/site";

// Every project, article and page in full, as plain text, for language models that read one file.
// The companion of llms.txt. English only.
const prose = (text: string) =>
  text
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .trim();

const project = (p: Project) =>
  [
    `## Project: ${p.name}`,
    `Source page: ${canonical(`/work/${p.slug}/`) ?? `/work/${p.slug}/`}`,
    `Status: ${p.status}. Category: ${p.categoryLabel}. Built with: ${p.tech.join(", ")}.`,
    p.summary,
    p.facts.length ? `### In numbers\n\n${p.facts.map((f) => `- ${f.label}: ${plainText(f.value)}`).join("\n")}` : "",
    ...(p.story
      ? [`### The project story\n\n${prose(p.story.source.replace(/^\{\{figure:\d+\}\}\s*$/gm, ""))}`]
      : [
          `### Why it exists\n\n${prose(p.context)}`,
          `### How it works\n\n${prose(p.inside)}`,
          `### Where it stands\n\n${prose(p.standing)}`,
        ]),
  ]
    .filter(Boolean)
    .join("\n\n");

const article = (p: Post) =>
  [`## Article: ${p.title}`, `Source page: ${canonical(`/blog/${p.slug}/`) ?? `/blog/${p.slug}/`}`, `Published ${isoDate(p.publishedAt)}. Tags: ${p.tags.join(", ")}.`, p.description, prose(p.markdown)].join("\n\n");

export const GET: APIRoute = () => {
  const { about, certificates, certificatesIntro, cv, posts, projects } = getContent("en");
  const text = [
    `# ${site.name}: full text`,
    `Projects, articles and pages by ${site.name}, in full. The short index is at /llms.txt. German versions are under /de/.`,
    `## About ${site.name}`,
    `Source page: ${canonical("/about/") ?? "/about/"}`,
    prose(about.profile),
    prose(about.biography),
    `### What I keep exploring`,
    about.topics.trim(),
    `## ${cv.title}`,
    `Source page: ${canonical("/cv/") ?? "/cv/"}`,
    `${site.fullName}. ${cv.tagline}`,
    prose(cv.body),
    `## Certificates`,
    `Source page: ${canonical("/certificates/") ?? "/certificates/"}`,
    prose(certificatesIntro),
    ...certificates.map((cert) => `- ${cert.title}: ${plainText(cert.issuer)}, ${cert.date}. ${prose(cert.text)}`),
    ...projects.map(project),
    ...posts.map(article),
  ];
  return new Response(`${text.join("\n\n")}\n`, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
};
