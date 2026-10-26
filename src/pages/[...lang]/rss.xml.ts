import type { APIRoute } from "astro";
import { getContent } from "../../lib/content";
import { langOf, langParams, ui, url } from "../../lib/i18n";
import { canonical, site } from "../../lib/site";

// The writing as a feed, one per language: /rss.xml and /de/rss.xml. A feed needs absolute links,
// so the files are written only when the build has its public origin.
export const getStaticPaths = () => (canonical("/") ? langParams() : []);

const escape = (text: string) => text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export const GET: APIRoute = ({ params }) => {
  const lang = langOf(params.lang);
  const t = ui[lang];
  const { posts } = getContent(lang);
  const link = (path: string) => canonical(url(lang, path)) ?? url(lang, path);
  const items = posts.map((post) => {
    const address = link(`/blog/${post.slug}/`);
    return `    <item>
      <title>${escape(post.title)}</title>
      <link>${address}</link>
      <guid isPermaLink="true">${address}</guid>
      <pubDate>${post.publishedAt.toUTCString()}</pubDate>
      <description>${escape(post.description)}</description>
    </item>`;
  });
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escape(t.feedTitle)}</title>
    <link>${link("/blog/")}</link>
    <description>${escape(t.writingDescription(site.name))}</description>
    <language>${t.htmlLang}</language>
    <atom:link href="${link("/rss.xml")}" rel="self" type="application/rss+xml" />
${items.join("\n")}
  </channel>
</rss>
`;
  return new Response(xml, { headers: { "Content-Type": "application/rss+xml; charset=utf-8" } });
};
