// The project page: the outline on the left follows the section on screen (a marker slides
// to it), a click on it glides there, and [ and ] step to the previous and next project.
// Without this file the outline is plain anchor links and the pager is plain links.
import { editor } from "./editor";
import { sound } from "./sound";
import { motionAllowed } from "./smear";
import { remember } from "./journey";

const links = [...document.querySelectorAll<HTMLAnchorElement>("[data-spy]")];
const blocks = links.map((link) => document.getElementById(link.dataset.spy!)!);
const track = links[0]?.closest<HTMLElement>("ol");
let current = blocks[0].id;
let locked = false; // a click on the outline owns the marker until the scroll it started ends
let lockTimer = 0;

/** Puts the marker beside a link. It slides there once the page has settled (see pages.css). */
function slide(link: HTMLElement) {
  track?.style.setProperty("--y", `${link.offsetTop}px`);
  track?.style.setProperty("--h", `${link.offsetHeight}px`);
}

function mark(id: string) {
  current = id;
  for (const link of links) {
    if (link.dataset.spy === id) {
      link.setAttribute("aria-current", "true");
      slide(link);
    } else link.removeAttribute("aria-current");
  }
}

function unlock() {
  clearTimeout(lockTimer);
  locked = false;
  update();
}

// The current section is the last one whose top has passed a line a third of the way down.
let frame = 0;
function update() {
  frame = 0;
  if (locked) return;
  const line = innerHeight * 0.33;
  const atBottom = scrollY + innerHeight >= document.documentElement.scrollHeight - 2;
  let here = blocks[0].id;
  for (const block of blocks) if (block.getBoundingClientRect().top <= line) here = block.id;
  const id = atBottom ? blocks[blocks.length - 1].id : here;
  if (id !== current || !track?.style.getPropertyValue("--h")) mark(id);
}
addEventListener(
  "scroll",
  () => {
    if (!frame) frame = requestAnimationFrame(update);
  },
  { passive: true },
);
update();
// The marker is placed without sliding on load; it only slides once the page has painted.
requestAnimationFrame(() => requestAnimationFrame(() => track?.setAttribute("data-ready", "")));
addEventListener("resize", () => mark(current)); // the outline is hidden on narrow screens, so its size is read again

for (const link of links) {
  link.addEventListener("click", (event) => {
    const target = document.getElementById(link.dataset.spy!);
    if (!target) return;
    event.preventDefault();
    target.scrollIntoView({ behavior: motionAllowed() ? "smooth" : "auto", block: "start" });
    history.replaceState(null, "", `#${target.id}`);
    locked = true;
    mark(target.id);
    clearTimeout(lockTimer);
    lockTimer = window.setTimeout(unlock, motionAllowed() ? 1000 : 50);
    if ("onscrollend" in window) addEventListener("scrollend", unlock, { once: true });
    sound.play("tick");
  });
}

editor.onKey((event) => {
  if (event.key !== "]" && event.key !== "[") return false;
  const link = document.querySelector<HTMLAnchorElement>(event.key === "]" ? "[data-next]" : "[data-prev]");
  if (!link) return false;
  sound.play("confirm");
  remember(link);
  location.assign(link.href);
  return true;
});
