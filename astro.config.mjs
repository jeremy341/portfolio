import { defineConfig } from "astro/config";
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

// The public origin. PUBLIC_SITE_URL overrides it; an empty value turns off the output that
// needs an origin (canonical URLs, the sitemap, the feeds and absolute share images).
export const origin = process.env.PUBLIC_SITE_URL ?? "https://jeremydarko.me";
const site = origin.replace(/\/$/, "") || undefined;

/** Adds the local writing desk at /write/ only while running `astro dev`. */
function writingDesk() {
  return {
    name: "writing-desk",
    hooks: {
      "astro:config:setup": ({ command, injectRoute }) => {
        if (command !== "dev") return;
        injectRoute({ pattern: "/write", entrypoint: "./src/writer/WritePage.astro" });
      },
    },
  };
}

// /start/ was the comparison home; it is now the home page, so old links move there.
const redirects = { "/start/": "/", "/de/start/": "/de/" };

/** Writes sitemap.xml after the build, but only when a real origin is set. Each URL names its German and English twin. */
function sitemap() {
  return {
    name: "sitemap",
    hooks: {
      "astro:build:done": ({ dir, pages }) => {
        if (!site) return;
        const paths = new Set(
          pages.map((page) => `/${page.pathname}`.replace(/\/+$/, "/")).filter((path) => path !== "/404/" && !(path in redirects)),
        );
        const english = (path) => path.replace(/^\/de(?=\/)/, "") || "/";
        const twins = (path) => [
          ["en", english(path)],
          ["de", english(path) === "/" ? "/de/" : `/de${english(path)}`],
          ["x-default", english(path)],
        ];
        const urls = [...paths].sort().map((path) => {
          const alternates = twins(path)
            .filter(([, twin]) => paths.has(twin))
            .map(([code, twin]) => `    <xhtml:link rel="alternate" hreflang="${code}" href="${site}${twin}"/>`);
          // Only articles carry dates (their article meta tags), so only they get a lastmod.
          const html = readFileSync(new URL(`.${path}index.html`, dir), "utf8");
          const modified = html.match(/<meta property="article:modified_time" content="(\d{4}-\d{2}-\d{2})/) ?? html.match(/<meta property="article:published_time" content="(\d{4}-\d{2}-\d{2})/);
          const lastmod = modified ? [`    <lastmod>${modified[1]}</lastmod>`] : [];
          return [`  <url>`, `    <loc>${site}${path}</loc>`, ...lastmod, ...alternates, `  </url>`].join("\n");
        });
        const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urls.join("\n")}\n</urlset>\n`;
        writeFileSync(new URL("sitemap.xml", dir), xml);
        console.log(`sitemap.xml written to ${fileURLToPath(dir)}`);
      },
    },
  };
}

export default defineConfig({
  site,
  trailingSlash: "always",
  build: { format: "directory" },
  redirects,
  compressHTML: true,
  prefetch: { prefetchAll: true, defaultStrategy: "hover" },
  devToolbar: { enabled: false },
  integrations: [writingDesk(), sitemap()],
});
