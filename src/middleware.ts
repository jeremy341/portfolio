import { defineMiddleware } from "astro:middleware";
import { ui } from "./lib/i18n";
import { canonical } from "./lib/site";

// Extend the page list without changing the existing llms.txt endpoint.
export const onRequest = defineMiddleware(async ({ url }, next) => {
  if (url.pathname !== "/llms.txt") return next();

  const response = await next();
  if (!response.ok) return response;

  const entries = Object.entries(ui.en.notes).map(([slug, { title, description }]) => {
    const path = `/${slug}/`;
    return `- [${title}](${canonical(path) ?? path}): ${description}`;
  });
  const text = await response.text();
  const pages = "\n## Pages\n";
  return new Response(text.replace(pages, `${pages}${entries.join("\n")}\n`), response);
});
