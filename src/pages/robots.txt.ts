import type { APIRoute } from "astro";

// Every crawler is welcome: search engines, answer engines and AI training crawlers alike.
// Nothing is disallowed, including the blog and the llms.txt/llms-full.txt feeds.
export const GET: APIRoute = ({ site }) => {
  const lines = ["User-agent: *", "Allow: /"];
  if (site) lines.push("", `Sitemap: ${new URL("/sitemap.xml", site)}`);
  return new Response(`${lines.join("\n")}\n`, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
};
