// The finder: search every page, project and article from anywhere, like Telescope in Neovim.
// `/` (or Ctrl+K, :find, or the Search button in the header) opens it, the arrow keys move
// through the matches, Enter opens one and Escape closes it. The index is /search.json, read
// the first time the finder opens, so no page carries it. Without this file the site works
// the same, you just browse it instead.
import { editor } from "./editor";
import { sound } from "./sound";
import { remember } from "./journey";
import { langOf, prefix, ui } from "../lib/i18n";

const lang = langOf(document.documentElement.lang);
const t = ui[lang].finder;

interface Item {
  k: "page" | "project" | "post";
  t: string; // title
  h: string; // href
  m: string; // meta line
  s: string; // summary
  g: string[]; // tags
  b: string; // text to search that is not shown in the list
}

interface Hit {
  item: Item;
  score: number;
  note: string; // a snippet, when the words were only found in the text
}

const KIND = t.kinds;

let dialog: HTMLDialogElement;
let input: HTMLInputElement;
let list: HTMLUListElement;
let preview: HTMLElement;
let count: HTMLElement;
let live: HTMLElement;
let items: Item[] | null = null;
let failed = false;
let hits: Hit[] = [];
let tokens: string[] = [];
let at = 0;

const lower = (text: string) => text.toLowerCase();

/** True when the letters of `token` appear in `text` in order (TorchVK from "trchvk"). */
function subsequence(text: string, token: string) {
  let from = 0;
  for (const ch of token) {
    from = text.indexOf(ch, from) + 1;
    if (!from) return false;
  }
  return true;
}

function search(query: string): Hit[] {
  tokens = lower(query).split(/\s+/).filter(Boolean);
  if (!items) return [];
  if (!tokens.length) return items.map((item) => ({ item, score: 0, note: "" }));
  const found: Hit[] = [];
  for (const item of items) {
    const title = lower(item.t);
    const tags = lower(item.g.join(" "));
    const meta = lower(item.m);
    const summary = lower(item.s);
    const body = lower(item.b);
    let score = 0;
    let note = "";
    let ok = true;
    for (const token of tokens) {
      if (title.startsWith(token)) score += 100;
      else if (title.includes(token)) score += 70;
      else if (tags.includes(token)) score += 50;
      else if (meta.includes(token)) score += 40;
      else if (summary.includes(token)) score += 30;
      else if (body.includes(token)) {
        score += 10;
        if (!note) {
          const start = Math.max(0, body.indexOf(token) - 28);
          note = `${start ? "..." : ""}${item.b.slice(start, start + 84).trim()}...`;
        }
      } else if (token.length > 2 && subsequence(title, token)) score += 20;
      else {
        ok = false;
        break;
      }
    }
    if (ok) found.push({ item, score, note });
  }
  return found.sort((a, b) => b.score - a.score);
}

/** The text with every search word wrapped in <b>, built from nodes so nothing is parsed as HTML. */
function marked(text: string): Node {
  const out = document.createDocumentFragment();
  if (!tokens.length) {
    out.append(text);
    return out;
  }
  const words = [...tokens].sort((a, b) => b.length - a.length).map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  let last = 0;
  for (const found of text.matchAll(new RegExp(words.join("|"), "gi"))) {
    const start = found.index ?? 0;
    out.append(text.slice(last, start));
    const hit = document.createElement("b");
    hit.textContent = found[0];
    out.append(hit);
    last = start + found[0].length;
  }
  out.append(text.slice(last));
  return out;
}

const el = <T extends HTMLElement>(tag: string, className?: string, text?: string) => {
  const node = document.createElement(tag) as T;
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
};

function paintList() {
  list.replaceChildren(
    ...hits.map(({ item }, i) => {
      const row = el("li", "f-row");
      row.id = `f-${i}`;
      row.setAttribute("role", "option");
      const name = el("span", "f-name");
      name.append(marked(item.t));
      row.append(el("span", "f-kind", KIND[item.k]), name);
      return row;
    }),
  );
  count.textContent = items ? `${hits.length}/${items.length}` : "";
  live.textContent = !items ? (failed ? t.unavailable : "") : hits.length ? t.results(hits.length) : t.none;
  if (!hits.length) {
    list.append(el("li", "f-empty", failed ? t.failed : items ? t.nothing(input.value.trim()) : t.loading));
  }
}

function paintPreview() {
  const hit = hits[at];
  preview.replaceChildren();
  if (!hit) return;
  const { item, note } = hit;
  const tags = el("p", "f-tags");
  tags.append(...item.g.map((tag) => el("span", "tag", tag)));
  preview.append(el("p", "f-path", `~/jeremy-darko${item.h.replace(/\/$/, "") || "/index"}.md`), el("p", "f-title"), el("p", "f-meta", item.m), el("p", "f-sum"));
  preview.querySelector(".f-title")!.append(marked(item.t));
  preview.querySelector(".f-sum")!.append(marked(item.s));
  if (item.g.length) preview.append(tags);
  if (note) {
    const line = el("p", "f-note");
    line.append(el("span", "f-label", t.inText), marked(note));
    preview.append(line);
  }
}

function select(next: number, noise = true) {
  if (!hits.length) return;
  const rows = list.children;
  rows[at]?.removeAttribute("aria-selected");
  rows[at]?.classList.remove("on");
  at = (next + hits.length) % hits.length;
  const row = rows[at] as HTMLElement;
  row.setAttribute("aria-selected", "true");
  row.classList.add("on");
  input.setAttribute("aria-activedescendant", row.id);
  row.scrollIntoView({ block: "nearest" });
  // The selection bar slides to the row when you move; typing a new query just places it.
  list.toggleAttribute("data-glide", noise);
  list.style.setProperty("--sy", `${row.offsetTop}px`);
  list.style.setProperty("--sh", `${row.offsetHeight}px`);
  paintPreview();
  if (noise) sound.play("tick", { gain: 0.6 });
}

function refresh() {
  hits = search(input.value);
  at = 0;
  paintList();
  if (hits.length) select(0, false);
  else {
    list.style.setProperty("--sh", "0px");
    input.removeAttribute("aria-activedescendant");
    paintPreview();
  }
}

function go(hit: Hit | undefined) {
  if (!hit) return;
  sound.play("confirm");
  remember(list.children[hits.indexOf(hit)] ?? null);
  dialog.close();
  location.assign(hit.item.h);
}

function build() {
  dialog = el("dialog", "finder");
  dialog.setAttribute("aria-label", t.searchAria);
  const box = el("div", "f-box");
  const bar = el("label", "f-bar");
  const prompt = el("span", "f-prompt", ">");
  prompt.setAttribute("aria-hidden", "true");
  input = el("input");
  input.type = "text";
  input.placeholder = t.placeholder;
  input.autocomplete = "off";
  input.autocapitalize = "off";
  input.spellcheck = false;
  input.enterKeyHint = "go";
  input.setAttribute("role", "combobox");
  input.setAttribute("aria-expanded", "true");
  input.setAttribute("aria-controls", "f-list");
  input.setAttribute("aria-autocomplete", "list");
  count = el("span", "f-count");
  count.setAttribute("aria-hidden", "true");
  bar.append(prompt, input, count);

  list = el("ul", "f-list");
  list.id = "f-list";
  list.setAttribute("data-lenis-prevent", "");
  list.setAttribute("role", "listbox");
  list.setAttribute("aria-label", t.resultsAria);
  preview = el("div", "f-preview");
  preview.setAttribute("data-lenis-prevent", "");
  preview.setAttribute("aria-hidden", "true");
  const main = el("div", "f-main");
  main.append(list, preview);

  const keys = el("p", "f-keys", t.hint);
  keys.setAttribute("aria-hidden", "true");
  live = el("p", "sr-only");
  live.setAttribute("role", "status");

  box.append(bar, main, keys, live);
  dialog.append(box);
  document.body.append(dialog);

  input.addEventListener("input", () => {
    sound.play("thock");
    refresh();
  });
  input.addEventListener("keydown", (event) => {
    const ctrl = event.ctrlKey && !event.metaKey && !event.altKey;
    if (event.key === "ArrowDown" || (ctrl && /^[njNJ]$/.test(event.key)) || (event.key === "Tab" && !event.shiftKey)) {
      event.preventDefault();
      select(at + 1);
    } else if (event.key === "ArrowUp" || (ctrl && /^[pkPK]$/.test(event.key)) || (event.key === "Tab" && event.shiftKey)) {
      event.preventDefault();
      select(at - 1);
    } else if (event.key === "Enter") {
      event.preventDefault();
      go(hits[at]);
    }
  });
  list.addEventListener("pointermove", (event) => {
    if (event.pointerType !== "mouse") return;
    const row = (event.target as HTMLElement).closest<HTMLElement>(".f-row");
    const index = row ? [...list.children].indexOf(row) : -1;
    if (index >= 0 && index !== at) select(index);
  });
  list.addEventListener("click", (event) => {
    const row = (event.target as HTMLElement).closest<HTMLElement>(".f-row");
    if (row) go(hits[[...list.children].indexOf(row)]);
  });
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) dialog.close();
  });
  dialog.addEventListener("close", () => editor.setMode(null));
}

async function load() {
  try {
    const response = await fetch(`${prefix(lang)}/search.json`);
    if (!response.ok) throw new Error(String(response.status));
    items = (await response.json()) as Item[];
  } catch {
    failed = true;
  }
  if (dialog.open) refresh();
}

function open() {
  if (dialog?.open) return;
  if (!dialog) build();
  editor.setMode("FIND");
  sound.play("open");
  dialog.showModal();
  input.value = "";
  refresh();
  if (!items && !failed) void load();
}

editor.onKey((event) => (event.key === "/" ? (open(), true) : false));
editor.onCommand("find", open);

addEventListener("keydown", (event) => {
  if ((event.ctrlKey || event.metaKey) && !event.altKey && event.key.toLowerCase() === "k" && !dialog?.open) {
    event.preventDefault();
    open();
  }
});

for (const button of document.querySelectorAll<HTMLElement>("[data-find]")) {
  button.addEventListener("click", open);
}
