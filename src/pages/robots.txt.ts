import type { APIRoute } from "astro";

// Search crawlers are welcome, including OpenAI's search crawler.
// OpenAI's training crawler is not.
export const GET: APIRoute = ({ site }) => {
  const lines = [
    "User-agent: OAI-SearchBot",
    "Allow: /",
    "",
    "User-agent: GPTBot",
    "Disallow: /",
    "",
    "User-agent: *",
    "Allow: /",
  ];
  if (site) lines.push("", `Sitemap: ${new URL("/sitemap.xml", site)}`);
  return new Response(`${lines.join("\n")}\n`, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
};
