// The home hero's mouse hover (hero.ts) on the headlines of the inner pages (MIRA, Work,
// Writing, article titles and the section headings): letters near the pointer thin out as
// it passes, like light bending the type, the letter under it gets a hollow block (Neovim's
// unfocused cursor) showing where a click would put the real one, and a quiet tick plays as
// the pointer crosses letters. On the page title a click really does move the cursor, with
// the same smear and sounds as the hero. Every letter keeps its advance width, so nothing
// shifts. Without this file the headings are plain text. Imported after editor.ts, which
// puts the Normal-mode cursor on the first letter of the page title first. Left and right
// arrows move that cursor too, the same way.
import { editor } from "./editor";
import { sound } from "./sound";
import { boxOf, motionAllowed, smearTo } from "./smear";

const SELECTOR = ".page-title, .prose h2, .block h2, .index-title";
const REACH = 2.3; // letter widths, as in the hero
const DROP = 470; // weight taken away at the pointer (the hero goes from 700 to 230)
const hover = matchMedia("(hover: hover) and (pointer: fine)");

interface Heading {
  letters: HTMLElement[];
  weights: number[];
  written: string[];
  base: number;
  thin: number;
  pointer: { x: number; y: number } | null;
  ghost: HTMLElement | null;
  hasCursor: boolean; // only the page title carries the Normal-mode cursor
  at: number; // the letter the block cursor rests on, or flies to
}

const active = new Set<Heading>();
const all: Heading[] = [];
let raf = 0;

/** Wraps every non-space character in a span, keeping the spaces as text so lines still wrap. */
function split(heading: HTMLElement) {
  const walker = document.createTreeWalker(heading, NodeFilter.SHOW_TEXT);
  const texts: Text[] = [];
  for (let node = walker.nextNode(); node; node = walker.nextNode()) texts.push(node as Text);
  const letters: HTMLElement[] = [];
  for (const text of texts) {
    const fragment = document.createDocumentFragment();
    for (const part of text.data.split(/(\s+)/)) {
      if (!part) continue;
      if (/^\s+$/.test(part)) {
        fragment.append(part);
        continue;
      }
      for (const ch of part) {
        const span = document.createElement("span");
        span.className = "ht";
        span.textContent = ch;
        letters.push(span);
        fragment.append(span);
      }
    }
    text.replaceWith(fragment);
  }
  return letters;
}

function tick() {
  raf = 0;
  // Read every box first, then write, so the browser lays the text out once per frame.
  const list = [...active];
  const reads = list.map((heading) => heading.letters.map((letter) => letter.getBoundingClientRect()));
  list.forEach((heading, h) => {
    let moving = false;
    heading.letters.forEach((letter, i) => {
      const box = reads[h][i];
      let goal = heading.base;
      if (heading.pointer) {
        const d = Math.hypot(heading.pointer.x - (box.left + box.width / 2), heading.pointer.y - (box.top + box.height / 2)) / box.width;
        goal = heading.base - (heading.base - heading.thin) * Math.exp(-((d / REACH) ** 2));
      }
      const now = heading.weights[i];
      const next = Math.abs(goal - now) < 2 ? goal : now + (goal - now) * 0.22;
      heading.weights[i] = next;
      if (next !== goal) moving = true;
      const key = next === heading.base && !heading.pointer ? "" : String(Math.round(next));
      if (heading.written[i] === key) return;
      heading.written[i] = key;
      if (key === "") letter.style.removeProperty("font-weight");
      else letter.style.fontWeight = key;
    });
    if (!moving && !heading.pointer) active.delete(heading);
  });
  if (active.size) raf = requestAnimationFrame(tick);
}

const wake = () => {
  if (!raf) raf = requestAnimationFrame(tick);
};

function setGhost(heading: Heading, letter: HTMLElement | null) {
  if (letter === heading.ghost) return;
  if (heading.hasCursor) {
    heading.ghost?.classList.remove("hv");
    letter?.classList.add("hv");
  }
  heading.ghost = letter;
  if (letter) sound.play("tick", { gain: 0.5 });
}

function leave(heading: Heading) {
  heading.pointer = null;
  setGhost(heading, null);
  wake();
}

/** Moves the block cursor to a clicked letter with a smear, as in the hero. */
function moveCursor(heading: Heading, index: number) {
  const { letters } = heading;
  const from = boxOf(letters[heading.at]);
  const to = boxOf(letters[index]);
  letters[heading.at].classList.remove("cur");
  heading.at = index;
  sound.play("swish");
  void smearTo(from, to).then(() => {
    if (heading.at !== index) return;
    for (const letter of letters) letter.classList.remove("cur");
    letters[index].classList.add("cur");
    sound.play("land");
  });
}

for (const element of document.querySelectorAll<HTMLElement>(SELECTOR)) {
  if (!element.textContent?.trim()) continue;
  const wrapper = element.querySelector<HTMLElement>(":scope > .cur");
  const letters = split(element);
  // editor.ts put the cursor on a wrapper around the first letter; it moves onto the letter itself.
  const cursorLetter = wrapper?.querySelector<HTMLElement>(".ht");
  const hasCursor = element.classList.contains("page-title") && !!wrapper && !!cursorLetter;
  if (hasCursor) {
    wrapper.classList.remove("cur");
    cursorLetter!.classList.add("cur");
  }
  const base = Number.parseFloat(getComputedStyle(element).fontWeight) || 700;
  const heading: Heading = {
    letters,
    weights: letters.map(() => base),
    written: letters.map(() => ""),
    base,
    thin: Math.max(100, base - DROP),
    pointer: null,
    ghost: null,
    hasCursor,
    at: hasCursor ? letters.indexOf(cursorLetter!) : -1,
  };
  all.push(heading);

  element.addEventListener("pointermove", (event) => {
    if (event.pointerType !== "mouse" || !hover.matches || !motionAllowed()) return;
    heading.pointer = { x: event.clientX, y: event.clientY };
    const letter = (event.target as HTMLElement).closest<HTMLElement>(".ht");
    setGhost(heading, letter && letters.indexOf(letter) !== heading.at ? letter : null);
    active.add(heading);
    wake();
  });
  element.addEventListener("pointerleave", () => leave(heading));

  if (hasCursor) {
    element.addEventListener("click", (event) => {
      const letter = (event.target as HTMLElement).closest<HTMLElement>(".ht");
      const index = letter ? letters.indexOf(letter) : -1;
      if (index < 0 || index === heading.at || !getSelection()?.isCollapsed) return;
      moveCursor(heading, index);
    });
  }
}

// Left and right move the page title's block cursor letter by letter, as a click does. editor.ts
// has already dropped the event when keys are off or a field has focus; an open dialog (the
// finder) keeps its own keys.
const cursored = all.find((heading) => heading.hasCursor);
editor.onKey((event) => {
  if (!cursored || (event.key !== "ArrowLeft" && event.key !== "ArrowRight")) return false;
  if (document.querySelector("dialog[open]")) return false;
  const next = cursored.at + (event.key === "ArrowLeft" ? -1 : 1);
  if (next < 0 || next >= cursored.letters.length) return false;
  moveCursor(cursored, next);
  return true;
});

addEventListener("blur", () => {
  for (const heading of all) leave(heading);
});
