import type { APIRoute } from "astro";
import { getContent, type Post, type Project } from "../lib/content";
import { plainText } from "../lib/markdown";
import { isoDate, site } from "../lib/site";

// Every project and article in full, as plain text, for language models that read one file. The
// companion of llms.txt. English only.
const prose = (text: string) => text.replace(/!?\[([^\]]*)\]\([^)]*\)/g, "$1").trim();

const project = (p: Project) =>
  [
    `## Project: ${p.name}`,
    `Status: ${p.status}. Category: ${p.categoryLabel}. Built with: ${p.tech.join(", ")}.`,
    p.summary,
    p.facts.length ? `### In numbers\n\n${p.facts.map((f) => `- ${f.label}: ${plainText(f.value)}`).join("\n")}` : "",
    `### Why it exists\n\n${prose(p.context)}`,
    `### How it works\n\n${prose(p.inside)}`,
    `### Where it stands\n\n${prose(p.standing)}`,
  ]
    .filter(Boolean)
    .join("\n\n");

const article = (p: Post) =>
  [`## Article: ${p.title}`, `Published ${isoDate(p.publishedAt)}. Tags: ${p.tags.join(", ")}.`, p.description, prose(p.markdown)].join("\n\n");

export const GET: APIRoute = () => {
  const { posts, projects } = getContent("en");
  const text = [
    `# ${site.name}: full text`,
    `Projects and articles by ${site.name}, in full. The short index is at /llms.txt. German versions are under /de/.`,
    ...projects.map(project),
    ...posts.map(article),
  ];
  return new Response(`${text.join("\n\n")}\n`, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
};
