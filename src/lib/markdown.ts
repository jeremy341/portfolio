import MarkdownIt from "markdown-it";
import { createHighlighter } from "shiki";
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

/* Editor-like fenced blocks. Shiki uses the same TextMate grammar approach
 * as VS Code and generates dual-theme tokens during the build; no client JS.
 * The parser keeps raw HTML disabled and escapes all author-supplied labels.
 */
const esc = (value: string) => md.utils.escapeHtml(value);
const highlighter = await createHighlighter({
  themes: ["tokyo-night", "github-light"],
  langs: ["javascript", "typescript", "python", "bash", "json", "sql", "cpp", "yaml"],
});

const languages: Record<string, { grammar: string | null; label: string; extension: string }> = {
  js: { grammar: "javascript", label: "JavaScript", extension: "js" },
  javascript: { grammar: "javascript", label: "JavaScript", extension: "js" },
  ts: { grammar: "typescript", label: "TypeScript", extension: "ts" },
  typescript: { grammar: "typescript", label: "TypeScript", extension: "ts" },
  py: { grammar: "python", label: "Python", extension: "py" },
  python: { grammar: "python", label: "Python", extension: "py" },
  bash: { grammar: "bash", label: "Shell", extension: "sh" },
  sh: { grammar: "bash", label: "Shell", extension: "sh" },
  json: { grammar: "json", label: "JSON", extension: "json" },
  sql: { grammar: "sql", label: "SQL", extension: "sql" },
  cpp: { grammar: "cpp", label: "C++", extension: "cpp" },
  c: { grammar: "cpp", label: "C", extension: "c" },
  yaml: { grammar: "yaml", label: "YAML", extension: "yaml" },
  yml: { grammar: "yaml", label: "YAML", extension: "yaml" },
  text: { grammar: null, label: "Output", extension: "txt" },
  plaintext: { grammar: null, label: "Output", extension: "txt" },
};

function editorCode(source: string, grammar: string | null, key: string): string {
  const safeLanguage = key.replace(/[^a-z0-9-]/g, "");
  if (grammar) {
    const highlighted = highlighter.codeToHtml(source, {
      lang: grammar,
      themes: { dark: "tokyo-night", light: "github-light" },
      defaultColor: false,
    });
    // Add a stable language class to the known Shiki-generated code element.
    return highlighted.replace("<code>", '<code class="language-' + safeLanguage + '">');
  }
  const lines = source.split("\n").map((line) => '<span class="line">' + esc(line) + "</span>").join("\n");
  return '<pre class="shiki shiki-plain" tabindex="0"><code class="language-' + safeLanguage + '">' + lines + "</code></pre>";
}

md.renderer.rules.fence = (tokens, idx, _options, env) => {
  const german = (env as { lang?: Lang })?.lang === "de";
  const token = tokens[idx];
  const info = token.info.trim().split(/\s+/).filter(Boolean);
  const key = (info[0] || "text").toLowerCase();
  const source = token.content.replace(/\n$/, "");
  const titleValue = info.slice(1).find((part) => part.startsWith("title="))?.slice(6);
  const safeTitle = titleValue && /^[A-Za-z0-9_./-]{1,80}$/.test(titleValue) ? titleValue : null;

  if (key === "flow") {
    const steps = source.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
    if (steps.length > 1 && steps.length <= 16) {
      const content = steps.map((step) => "<li><span>" + esc(step) + "</span></li>").join("");
      return '<div class="project-flow" role="group" aria-label="' + (german ? "Ablaufdiagramm" : "Process flow diagram") + '">' +
        '<p class="project-flow-label">PIPELINE / ' + steps.length + (german ? ' SCHRITTE' : ' STEPS') + '</p><ol>' +
        content + "</ol></div>\n";
    }
  }

  const entry = languages[key] ?? { grammar: null, label: "Code", extension: "txt" };
  const filename = safeTitle || "snippet." + entry.extension;
  const numberOfLines = source ? source.split("\n").length : 0;
  return '<div class="code-panel" role="group" aria-label="' + esc(entry.label) + ' source example">' +
    '<div class="code-panel-title"><span class="code-file">' + esc(filename) + "</span>" +
    '<span class="code-meta">' + esc(entry.label) + " / " + numberOfLines + (numberOfLines === 1 ? " line" : " lines") +
    "</span></div>" + editorCode(source, entry.grammar, key) + "</div>\n";
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
