import MarkdownIt from "markdown-it";
import type { Lang } from "./i18n";

// Raw HTML in Markdown is never rendered; it shows up as escaped text.
const md = new MarkdownIt({ html: false, linkify: false, typographer: false });

// Kept here, not imported from i18n.ts, so the tests can load this file straight under Node.
const url = (lang: Lang, path: string) => (lang === "de" ? "/de" : "") + path;

/** Maps links between content files to the routes that serve them, in the page's language. */
export function resolveContentLink(href: string, lang: Lang = "en"): string {
  const post = href.match(/(?:^|\/)posts\/([\w-]+)\.md$/);
  if (post) return url(lang, `/blog/${post[1]}/`);
  const project = href.match(/(?:^|\/)projects\/([\w-]+)\.md$/);
  if (project) return url(lang, `/work/${project[1]}/`);
  // Site pages such as /cv/ stay in the reader's language (files such as the PDF do not).
  if (/^\/(?!\/|de\/)/.test(href) && !/\.\w+$/.test(href)) return url(lang, href);
  return href;
}

export function isExternal(href: string): boolean {
  return /^https?:\/\//.test(href);
}

const defaultLinkOpen =
  md.renderer.rules.link_open ?? ((tokens, idx, options, _env, self) => self.renderToken(tokens, idx, options));

md.renderer.rules.link_open = (tokens, idx, options, env, self) => {
  const token = tokens[idx];
  const href = resolveContentLink(String(token.attrGet("href") ?? ""), (env as { lang?: Lang }).lang);
  token.attrSet("href", href);
  if (isExternal(href)) {
    token.attrSet("target", "_blank");
    token.attrSet("rel", "noopener noreferrer");
  }
  return defaultLinkOpen(tokens, idx, options, env, self);
};

export function renderMarkdown(source: string, lang: Lang = "en"): string {
  return md.render(source, { lang });
}

export function renderInline(source: string, lang: Lang = "en"): string {
  return md.renderInline(source, { lang });
}

/** Plain text of a Markdown snippet, for meta descriptions and reading time. */
export function plainText(source: string): string {
  return source
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[#>*_`]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}
