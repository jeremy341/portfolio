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

/* Fenced examples are rendered as real, horizontally scrollable code blocks.
 * All source is escaped before syntax spans are added: snippets are content,
 * never trusted HTML. The JS tokenizer is deliberately dependency-free.
 */
const codeWords = /^(?:const|let|var|return|function|if|else|while|for|await|async|import|export|from|class|new|throw|try|catch|finally|true|false|null|undefined)$/;
const codeBuiltins = /^(?:Date|Math|JSON|Object|Array|Number|String|Boolean|Promise|console)$/;
const codeToken = /\/\/[^\n]*|\/\*[\s\S]*?\*\/|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|\x60(?:\\.|[^\x60\\])*\x60|\b(?:const|let|var|return|function|if|else|while|for|await|async|import|export|from|class|new|throw|try|catch|finally|true|false|null|undefined|Date|Math|JSON|Object|Array|Number|String|Boolean|Promise|console)\b|\b\d+(?:\.\d+)?\b|\b[A-Za-z_$][\w$]*(?=\s*\()/g;
const esc = (value: string) => md.utils.escapeHtml(value);

function highlightJavaScript(source: string): string {
  let result = "";
  let cursor = 0;
  for (const match of source.matchAll(codeToken)) {
    const word = match[0];
    const start = match.index;
    result += esc(source.slice(cursor, start));
    let category = "function";
    if (/^\/[/*]/.test(word)) category = "comment";
    else if (/^["'\x60]/.test(word)) category = "string";
    else if (/^\d/.test(word)) category = "number";
    else if (codeWords.test(word)) category = "keyword";
    else if (codeBuiltins.test(word)) category = "builtin";
    result += '<span class="code-' + category + '">' + esc(word) + "</span>";
    cursor = start + word.length;
  }
  return result + esc(source.slice(cursor));
}

const codeLanguages: Record<string, string> = {
  js: "JavaScript", javascript: "JavaScript", ts: "TypeScript", typescript: "TypeScript",
  py: "Python", python: "Python", bash: "Shell", sh: "Shell", shell: "Shell",
  json: "JSON", sql: "SQL", text: "Output / protocol", plaintext: "Output / protocol",
};

md.renderer.rules.fence = (tokens, idx) => {
  const token = tokens[idx];
  const language = (token.info.trim().split(/\s+/)[0] || "text").toLowerCase();
  const source = token.content.replace(/\n$/, "");

  // A readable, responsive flow diagram replaces arrow-heavy ASCII art.
  if (language === "flow") {
    const steps = source.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
    if (steps.length > 1 && steps.length <= 16) {
      const content = steps.map((step) => "<li>" + esc(step) + "</li>").join("");
      return '<div class="project-flow" role="group" aria-label="Process flow diagram"><p class="project-flow-label">PROCESS FLOW</p><ol>' + content + "</ol></div>\n";
    }
  }

  const label = codeLanguages[language] ?? "Code";
  const safeLanguage = language.replace(/[^a-z0-9-]/g, "");
  const highlighted = ["js", "javascript", "ts", "typescript"].includes(language)
    ? highlightJavaScript(source)
    : esc(source);
  return (
    '<div class="code-panel" role="group" aria-label="' + esc(label) + ' example">' +
    '<div class="code-panel-title"><span class="code-panel-dot" aria-hidden="true"></span>' +
    esc(label) + "</div>" +
    '<pre tabindex="0"><code class="language-' + safeLanguage + '">' + highlighted + "</code></pre>" +
    "</div>\n"
  );
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
