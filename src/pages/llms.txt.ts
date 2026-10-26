import type { APIRoute } from "astro";
import { getContent, type Project } from "../lib/content";
import { plainText } from "../lib/markdown";
import { ui, url } from "../lib/i18n";
import { canonical, isoDate, site } from "../lib/site";

// A plain-text guide to the site for language models (the llms.txt convention): who the person is,
// what the site holds, and where each piece lives. English only; the German pages sit under /de/.
export const GET: APIRoute = () => {
  const { contact, posts, projects } = getContent("en");
  const t = ui.en;
  const link = (path: string) => canonical(url("en", path)) ?? url("en", path);
  const email = contact.direct.find((row) => row.href.startsWith("mailto:"))?.href.slice("mailto:".length);
  const downloads = projects.find((p) => p.slug === "mira")?.facts.find((f) => f.label === "Downloads")?.value;
  const source = (project: Project) => project.links.find((link) => link.kind === "source")?.href;

  const lines = [
    `# ${site.name}`,
    "",
    `> ${t.personDescription(site.name)} This site is the public record: ${projects.length} projects with their honest status, ${posts.length} articles, certificates, a CV and approved contact links.`,
    "",
    `Cite as: ${site.name}, ${link("/")}`,
    "",
    "## Facts",
    `- Full name: ${site.fullName}, published as ${site.name}`,
    `- Role: ${t.jobTitle}`,
    `- Based in: ${t.region}, Germany`,
    `- Email: ${email}`,
    ...(downloads ? [`- MIRA: ${plainText(downloads)}`] : []),
    "- University of Duisburg-Essen: project work with the Chair of Electronic Components and Circuits (EBS), and an internship from 3 to 28 August 2026. It is project work, not a university role.",
    "- Languages: English at the root of the site, German under /de/ with the same paths.",
    "",
    "## Profiles",
    ...contact.profiles.map((row) => `- ${row.label}: ${row.href}`),
    "",
    "## Projects",
    ...projects.map((p) => {
      const repo = source(p);
      return `- [${p.name}](${link(`/work/${p.slug}/`)}): ${p.summary} Status: ${p.status}. Category: ${p.categoryLabel}.${repo ? ` Source: ${repo}` : ""}`;
    }),
    "",
    "## Articles",
    ...posts.map((p) => `- [${p.title}](${link(`/blog/${p.slug}/`)}), published ${isoDate(p.publishedAt)}: ${p.description}`),
    "",
    "## Pages",
    `- [Work](${link("/work/")}): all projects.`,
    `- [Writing](${link("/blog/")}): all articles.`,
    `- [About](${link("/about/")}): biography, project work with UDE, community and internships.`,
    `- [Certificates](${link("/certificates/")}): certificates and references, each with its issuer.`,
    `- [CV](${link("/cv/")}): experience, education, skills and personal projects.`,
    `- [Contact](${link("/contact/")}): email and the approved public profiles.`,
    "",
    "## Full text",
    `- [llms-full.txt](${link("/llms-full.txt")}): every project and article in full, as plain text.`,
    "",
    "## Notes for quoting",
    "- Quote each project with its status. Several are early, in progress or unfinished, and the site says so.",
    "- The MIRA downloads are a download counter on Hugging Face. They are not a count of people.",
    "- Project work with UDE means work with a chair at the university. It is not a university role.",
    "",
  ];
  return new Response(lines.join("\n"), { headers: { "Content-Type": "text/plain; charset=utf-8" } });
};
