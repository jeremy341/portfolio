// Hovering a top-bar tab with the mouse, or tabbing to it from the keyboard, scrambles its letters
// for a quarter of a second, then settles them from left to right. The tab keeps its length, and
// the font is monospace, so the bar does not move. Off when motion is reduced; taps on touch
// screens do not trigger it.
import { motionAllowed } from "./smear";

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/<>{}[]#";
const DURATION = 250;
const frames = new WeakMap<HTMLElement, number>();

function scramble(link: HTMLElement) {
  if (!motionAllowed()) return;
  if (link.dataset.text === undefined) link.dataset.text = link.textContent ?? "";
  const final = link.dataset.text;
  cancelAnimationFrame(frames.get(link) ?? 0);
  const start = performance.now();
  const step = (now: number) => {
    const progress = Math.min(1, (now - start) / DURATION);
    const settled = Math.floor(progress * final.length);
    link.textContent = [...final]
      .map((char, i) => (i < settled || char === " " ? char : GLYPHS[Math.floor(Math.random() * GLYPHS.length)]))
      .join("");
    if (progress < 1) frames.set(link, requestAnimationFrame(step));
  };
  frames.set(link, requestAnimationFrame(step));
}

for (const link of document.querySelectorAll<HTMLElement>(".site-nav > a")) {
  link.addEventListener("pointerenter", (event) => {
    if (event.pointerType === "mouse") scramble(link);
  });
  link.addEventListener("focus", () => {
    if (link.matches(":focus-visible")) scramble(link);
  });
}
