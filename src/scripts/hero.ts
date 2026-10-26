// The home hero: the name plays a replace pass, and click and hover on its letters work the same way.
// The section rows below it behave like the home page's too (CSS and rows.ts), so nothing here
// touches them. Without this file the page still works as plain links.
import { editor } from "./editor";
import { sound } from "./sound";
import { boxOf, motionAllowed, smearTo } from "./smear";

const root = document.documentElement;
const cells = [...document.querySelectorAll<HTMLElement>(".dash-cells .c")];
const END = cells.length - 1; // one cell past the o, where Replace mode ends up
const LAST = END - 1; // the o
const DWELL = [90, 44, 40, 44, 48, 52, 84, 56, 40, 44, 44, 48]; // ms spent on each of J..o
const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

let timers: number[] = [];
let busy = false; // the intro owns the cursor
let at = LAST; // where the block cursor rests, or is flying to

function rest(index: number) {
  for (const cell of cells) cell.classList.remove("cur", "ul");
  cells[index].classList.add("cur");
  at = index;
  editor.setRuler(`1:${index + 1}`);
}

// Click a letter to put the cursor there (the cursor jumps with a smear), as on the home page.
const hero = document.querySelector<HTMLElement>(".dash-hero");
hero?.addEventListener("click", (event) => {
  const cell = (event.target as HTMLElement).closest<HTMLElement>(".dash-cells .c[data-l]");
  const index = cell ? cells.indexOf(cell) : -1;
  if (busy || index < 0 || index === at || !getSelection()?.isCollapsed) return;
  const from = boxOf(cells[at]);
  const to = boxOf(cells[index]);
  cells[at].classList.remove("cur");
  at = index;
  sound.play("swish");
  void smearTo(from, to).then(() => {
    if (at !== index) return;
    rest(index);
    sound.play("land");
  });
});

// Mouse hover: the letter under the pointer gets a hollow block (Neovim's unfocused cursor)
// showing where a click would put the real one. The letters themselves do not change.
const hover = matchMedia("(hover: hover) and (pointer: fine)");
let ghost: HTMLElement | null = null;

function setGhost(cell: HTMLElement | null) {
  if (cell === ghost) return;
  ghost?.classList.remove("hv");
  ghost = cell;
  ghost?.classList.add("hv");
  if (cell) sound.play("tick", { gain: 0.5 });
}

hero?.addEventListener("pointermove", (event) => {
  if (event.pointerType !== "mouse" || !hover.matches || !motionAllowed() || busy || root.hasAttribute("data-intro")) return;
  const cell = (event.target as HTMLElement).closest<HTMLElement>(".dash-cells .c[data-l]");
  setGhost(cell && cell !== cells[at] ? cell : null);
});
hero?.addEventListener("pointerleave", () => setGhost(null));
addEventListener("blur", () => setGhost(null));

// The replace pass: the cursor overwrites the name one cell at a time, then
// steps back onto the o. Any key, click, scroll or tab switch ends it at once.
function finish() {
  if (!busy) return;
  for (const t of timers) clearTimeout(t);
  timers = [];
  for (const cell of cells) cell.classList.add("done");
  editor.setMode(null);
  rest(LAST);
  root.removeAttribute("data-intro");
  root.removeAttribute("data-playing");
  busy = false;
  removeEventListener("keydown", finish, true);
  removeEventListener("pointerdown", finish, true);
  removeEventListener("wheel", finish, true);
  removeEventListener("touchstart", finish, true);
  removeEventListener("scroll", onScroll);
  document.removeEventListener("visibilitychange", onHidden);
}

const onScroll = () => {
  if (scrollY > 0) finish();
};
const onHidden = () => {
  if (document.hidden) finish();
};

async function fontReady() {
  if (!document.fonts) return true;
  const loaded = await Promise.race([
    document.fonts.load('700 1em "Geist Mono Variable"').then(() => true),
    wait(1200).then(() => false),
  ]).catch(() => false);
  // Safari reports fonts as ready a frame early.
  await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  return loaded && document.fonts.check('700 1em "Geist Mono Variable"');
}

async function play() {
  busy = true;
  setGhost(null);
  root.setAttribute("data-intro", "");
  root.setAttribute("data-playing", "");
  for (const cell of cells) cell.classList.remove("done", "cur", "ul");
  cells[0].classList.add("cur");
  at = 0;
  editor.setMode(null);
  editor.setRuler("1:1");

  addEventListener("keydown", finish, true);
  addEventListener("pointerdown", finish, true);
  addEventListener("wheel", finish, true);
  addEventListener("touchstart", finish, true);
  addEventListener("scroll", onScroll, { passive: true });
  document.addEventListener("visibilitychange", onHidden);
  timers.push(window.setTimeout(finish, 2500));

  if (!(await fontReady()) || !busy) return finish();

  const step = (ms: number, action: () => void) =>
    new Promise<void>((resolve) =>
      timers.push(
        window.setTimeout(() => {
          if (busy) action();
          resolve();
        }, ms),
      ),
    );

  await step(200, () => {
    editor.setMode("REPLACE");
    cells[0].classList.replace("cur", "ul");
    sound.play("open");
  });
  for (let i = 0; i < DWELL.length; i++) {
    await step(DWELL[i], () => {
      cells[i].classList.add("done");
      cells[i].classList.remove("ul");
      cells[i + 1].classList.add("ul");
      editor.setRuler(`1:${i + 2}`);
      sound.play("type", { pitch: 0.9 + i * 0.035 });
    });
  }
  await step(170, () => {
    // Esc: back to Normal mode, one cell to the left, onto the o.
    editor.setMode(null);
    rest(LAST);
    root.removeAttribute("data-intro");
    sound.play("thock");
  });
  finish();
}

editor.onCommand("intro", () => {
  scrollTo({ top: 0 });
  void play();
});

if (root.hasAttribute("data-intro")) void play();
else rest(LAST);
