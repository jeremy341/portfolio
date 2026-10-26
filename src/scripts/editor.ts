// The editor chrome shared by every page: status line, modes, keys and the command line.
// The markup is rendered by Base.astro; this file only brings it to life.

import { sound } from "./sound";
import { setTheme } from "./theme";
import { rememberHref } from "./journey";
import { langOf, sections as sectionList, ui, url } from "../lib/i18n";

export type Mode = "NORMAL" | "REPLACE" | "VISUAL" | "COMMAND" | "FIND";
type KeyHandler = (event: KeyboardEvent) => boolean;
type Route = { name: string; href: string };

const root = document.documentElement;
const find = <T extends HTMLElement>(selector: string) => document.querySelector<T>(selector)!;

const modeEl = find("[data-vs-mode]");
const pctEl = find("[data-vs-pct]");
const posEl = find("[data-vs-pos]");
const keysBtn = find<HTMLButtonElement>("[data-vs-keys]");
const soundBtn = find<HTMLButtonElement>("[data-vs-sound]");
const row = find(".vim-row");
const form = find<HTMLFormElement>(".vim-cmd");
const input = find<HTMLInputElement>(".vim-cmd input");
const msg = find(".vim-msg");
const routes: Route[] = JSON.parse(row.dataset.routes ?? "[]");
const lang = langOf(root.lang);
const t = ui[lang];

const LINE = 25.5; // 15px at line-height 1.7
const KEYS_STORE = "jd:keys";

// Mode ---------------------------------------------------------------------------------

let forced: Mode | null = null;
let cmdOpen = false;
let selecting = false;

function paintMode() {
  const mode: Mode = cmdOpen ? "COMMAND" : (forced ?? (selecting ? "VISUAL" : "NORMAL"));
  root.dataset.mode = mode.toLowerCase();
  modeEl.textContent = mode;
}

document.addEventListener("selectionchange", () => {
  const selection = getSelection();
  selecting = !!selection && !selection.isCollapsed && selection.toString().trim() !== "";
  paintMode();
});

// Position and scroll ---------------------------------------------------------------

let ruler: string | null = null;
let rulerPinned = false; // true: show the cursor's position even when the page is scrolled

function paintPosition() {
  const max = document.documentElement.scrollHeight - innerHeight;
  pctEl.textContent = max <= 0 ? "All" : scrollY <= 0 ? "Top" : scrollY >= max - 1 ? "Bot" : `${Math.round((scrollY / max) * 100)}%`;
  posEl.textContent = ruler !== null && (rulerPinned || scrollY < 1) ? ruler : `${Math.floor(scrollY / LINE) + 1}:1`;
}

addEventListener("scroll", paintPosition, { passive: true });
addEventListener("resize", paintPosition);

// Keys switch (WCAG 2.1.4: single character shortcuts need an off switch) ------------------

let keysOn = true;
try {
  keysOn = localStorage.getItem(KEYS_STORE) !== "off";
} catch {
  // Storage can be blocked; the keys then stay on for this page.
}

function setKeys(on: boolean) {
  keysOn = on;
  keysBtn.textContent = on ? t.keysOn : t.keysOff;
  try {
    localStorage.setItem(KEYS_STORE, on ? "on" : "off");
  } catch {
    // Not persisted; fine.
  }
}

keysBtn.addEventListener("click", () => {
  sound.play("tick");
  setKeys(!keysOn);
});

// Sound switch: the clicks are optional, and this is how to turn them off ------------------

function paintSound() {
  soundBtn.textContent = sound.enabled() ? t.soundOn : t.soundOff;
}

function setSound(on: boolean) {
  sound.set(on);
  paintSound();
  if (on) sound.play("confirm");
}

soundBtn.addEventListener("click", () => setSound(!sound.enabled()));

// A press on a link clicks like a button, before the page changes.
document.addEventListener("pointerdown", (event) => {
  if (event.button === 0 && (event.target as HTMLElement).closest("a[href]")) sound.play("confirm");
});
addEventListener("keydown", (event) => {
  if (event.key === "Enter" && (event.target as HTMLElement).closest?.("a[href]")) sound.play("confirm");
});

// Message line and command line share one row under the status line --------------------------

let clearTimer = 0;

function showRow(open: boolean) {
  row.toggleAttribute("data-open", open);
  root.toggleAttribute("data-row", open);
}

function say(text: string, error = false) {
  clearTimeout(clearTimer);
  msg.textContent = text;
  msg.toggleAttribute("data-error", error);
  if (error) sound.play("error");
  showRow(true);
  clearTimer = window.setTimeout(clearMessage, 6000);
}

function clearMessage() {
  if (cmdOpen) return;
  msg.textContent = "";
  showRow(false);
}

function openCommand(prefill = "") {
  clearTimeout(clearTimer);
  msg.textContent = "";
  cmdOpen = true;
  form.hidden = false;
  showRow(true);
  input.value = prefill;
  input.focus();
  paintMode();
  sound.play("open");
}

function closeCommand() {
  if (!cmdOpen) return;
  cmdOpen = false;
  form.hidden = true;
  completion = null;
  showRow(!!msg.textContent);
  paintMode();
}

// Completion with Tab cycles through the matches, like wildmenu.
let completion: { head: string; list: string[]; at: number } | null = null;
const COMMANDS = ["edit", "find", "help", "intro", "quit", "set", "write", "yank"];

function complete(step: number) {
  if (!completion) {
    const text = input.value;
    const file = text.match(/^(\S+)\s+(.*)$/);
    let head = "";
    let list: string[] = [];
    if (file && /^(e|edit)$/.test(file[1])) {
      head = `${file[1]} `;
      list = routes.map((r) => r.name).filter((n) => n.startsWith(file[2]));
    } else if (file && file[1] === "set") {
      head = "set ";
      list = ["keys", "nokeys", "sound", "nosound"].filter((n) => n.startsWith(file[2]));
    } else if (!file) {
      list = COMMANDS.filter((c) => c.startsWith(text));
    }
    if (!list.length) return;
    completion = { head, list, at: step > 0 ? -1 : 0 };
  }
  completion.at = (completion.at + step + completion.list.length) % completion.list.length;
  input.value = completion.head + completion.list[completion.at];
  sound.play("tick");
}

const commands = new Map<string, () => void>();

function openRoute(arg: string) {
  const want = arg.replace(/\.md$/, "").replace(/^~?\/?(jeremy-darko\/)?/, "").replace(/\/$/, "") || "index";
  const aliases: Record<string, string> = { home: "index", writing: "blog", projects: "work", projekte: "work", texte: "blog", lebenslauf: "cv" };
  const name = aliases[want] ?? want;
  const exact = routes.find((r) => r.name === name);
  if (exact) return location.assign(exact.href);
  const near = routes.filter((r) => r.name.endsWith(`/${name}`) || r.name.startsWith(name));
  if (near.length === 1) return location.assign(near[0].href);
  say(`E484: Can't open file ${arg}`, true);
}

function run(line: string) {
  const [name = "", ...rest] = line.trim().replace(/^:+/, "").split(/\s+/);
  const arg = rest.join(" ");
  switch (name) {
    case "":
      return;
    case "e":
    case "edit":
      if (!arg) return say("E32: No file name", true);
      return openRoute(arg);
    case "find":
    case "search":
      return commands.get("find")?.();
    case "y":
    case "yank":
      return commands.get("yank")?.();
    case "h":
    case "help":
      return say(t.help);
    case "q":
    case "q!":
    case "quit":
      return void location.assign(url(lang, "/"));
    case "w":
    case "write":
      return say("E45: 'readonly' option is set (add ! to override)", true);
    case "intro": {
      const replay = commands.get("intro");
      if (replay) return replay();
      try {
        sessionStorage.removeItem("jd:intro");
      } catch {
        // Nothing to clear.
      }
      return void location.assign(`${url(lang, "/")}?intro`);
    }
    case "set":
      if (arg === "nokeys") return setKeys(false);
      if (arg === "keys") return setKeys(true);
      if (arg === "keys?") return say(keysOn ? "  keys" : "nokeys");
      if (arg === "nosound") return setSound(false);
      if (arg === "sound") return setSound(true);
      if (arg === "sound?") return say(sound.enabled() ? "  sound" : "nosound");
      if (arg === "light") return setTheme("light");
      if (arg === "dark") return setTheme("dark");
      return say(`E518: Unknown option: ${arg}`, true);
    default:
      return say(`E492: Not an editor command: ${name}`, true);
  }
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const line = input.value;
  closeCommand();
  if (line.trim()) sound.play("confirm");
  run(line);
});

input.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    event.preventDefault();
    closeCommand();
  } else if (event.key === "Backspace" && input.value === "") {
    closeCommand();
  } else if (event.key === "Tab") {
    event.preventDefault();
    complete(event.shiftKey ? -1 : 1);
  } else if (event.key.length === 1 || event.key === "Backspace") {
    completion = null;
    sound.play("thock");
  }
});

input.addEventListener("blur", closeCommand);

// Keys ---------------------------------------------------------------------------------

const handlers: KeyHandler[] = [];
const sections: Record<string, string> = Object.fromEntries(
  t.homeKeys.map((key, i) => [key, url(lang, sectionList[i].path)]),
);
let pendingG = false;

function nudge(by: number) {
  scrollBy({ top: by });
  sound.play("tick");
}

addEventListener("keydown", (event) => {
  if (cmdOpen || event.isComposing || event.ctrlKey || event.metaKey || event.altKey) return;
  const target = event.target as HTMLElement;
  if (/^(INPUT|SELECT|TEXTAREA)$/.test(target.tagName) || target.isContentEditable) return;
  if (event.key === "Escape") {
    getSelection()?.removeAllRanges();
    clearMessage();
    return;
  }
  if (!keysOn) return;
  if (msg.textContent) clearMessage();

  if (handlers.some((handler) => handler(event))) {
    event.preventDefault();
    return;
  }

  const key = event.key;
  if (key === "g") {
    if (pendingG) {
      scrollTo({ top: 0 });
      sound.play("thock");
    }
    pendingG = !pendingG;
    return;
  }
  pendingG = false;

  if (key === ":") {
    event.preventDefault();
    openCommand();
  } else if (key === "j") nudge(90);
  else if (key === "k") nudge(-90);
  else if (key === "d") nudge(innerHeight / 2);
  else if (key === "u") nudge(-innerHeight / 2);
  else if (key === "G") {
    scrollTo({ top: document.documentElement.scrollHeight });
    sound.play("thock");
  } else if (key === "H") history.back();
  else if (key === "i" || key === "x") say("E21: Cannot make changes, 'modifiable' is off", true);
  else if (document.body.hasAttribute("data-home") && sections[key]) {
    sound.play("confirm");
    rememberHref(sections[key]);
    location.assign(sections[key]);
  }
});

// The current page title carries the Normal-mode cursor: a block on its first letter, as when
// a buffer opens (it blinks, see pages.css).
const title = document.querySelector<HTMLElement>(".page-title");
const head = title?.firstChild;
const first = head?.nodeType === Node.TEXT_NODE ? (head.textContent ?? "").search(/\S/) : -1;
if (title && head && first >= 0) {
  const text = head.textContent!;
  const letter = String.fromCodePoint(text.codePointAt(first)!);
  const cursor = document.createElement("span");
  cursor.className = "cur";
  cursor.textContent = letter;
  head.textContent = text.slice(0, first);
  head.after(cursor, text.slice(first + letter.length));
}

setKeys(keysOn);
paintSound();
paintMode();
paintPosition();

export const editor = {
  /** Pins a mode (the hero uses REPLACE); null hands control back to the selection. */
  setMode(mode: Mode | null) {
    forced = mode;
    paintMode();
  },
  /** Text for the line:column chip while the page is at the top; null restores the line count. */
  setRuler(text: string | null, pinned = false) {
    ruler = text;
    rulerPinned = pinned;
    paintPosition();
  },
  /** Page keys run before the global ones; return true when the key was used. */
  onKey(handler: KeyHandler) {
    handlers.push(handler);
  },
  /** Lets a page answer a command such as :intro. */
  onCommand(name: string, action: () => void) {
    commands.set(name, action);
  },
  say,
  keysEnabled: () => keysOn,
};
