// The "On this page" outline, shared by project pages and articles: a marker slides to the
// section on screen, and a click glides there. Without this file the outline is plain anchor
// links. A page without an outline (fewer than three headings) makes this file do nothing.
import { sound } from "./sound";
import { motionAllowed } from "./smear";

const links = [...document.querySelectorAll<HTMLAnchorElement>("[data-spy]")];
const blocks = links.map((link) => document.getElementById(link.dataset.spy!)).filter((el): el is HTMLElement => el !== null);

if (links.length > 0 && blocks.length === links.length) {
  const track = links[0].closest<HTMLElement>("ol");
  let current = blocks[0].id;
  let locked = false; // a click on the outline owns the marker until the scroll it started ends
  let lockTimer = 0;

  /** Puts the marker beside a link. It slides there once the page has settled (see pages.css). */
  const slide = (link: HTMLElement) => {
    track?.style.setProperty("--y", `${link.offsetTop}px`);
    track?.style.setProperty("--h", `${link.offsetHeight}px`);
  };

  const mark = (id: string) => {
    current = id;
    for (const link of links) {
      if (link.dataset.spy === id) {
        link.setAttribute("aria-current", "true");
        slide(link);
      } else link.removeAttribute("aria-current");
    }
  };

  // The current section is the last one whose top has passed a line a third of the way down.
  let frame = 0;
  const update = () => {
    frame = 0;
    if (locked) return;
    const line = innerHeight * 0.33;
    const atBottom = scrollY + innerHeight >= document.documentElement.scrollHeight - 2;
    let here = blocks[0].id;
    for (const block of blocks) if (block.getBoundingClientRect().top <= line) here = block.id;
    const id = atBottom ? blocks[blocks.length - 1].id : here;
    if (id !== current || !track?.style.getPropertyValue("--h")) mark(id);
  };

  const unlock = () => {
    clearTimeout(lockTimer);
    locked = false;
    update();
  };

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
  // The outline can be hidden or folded away, so its size is read again when the window or the fold changes.
  const measure = () => mark(current);
  addEventListener("resize", measure);
  track?.closest("details")?.addEventListener("toggle", measure);

  for (const link of links) {
    link.addEventListener("click", (event) => {
      const target = document.getElementById(link.dataset.spy!);
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({ behavior: motionAllowed() ? "smooth" : "auto", block: "start" });
      history.replaceState(null, "", `#${target.id}`);
      // Keyboard and screen-reader users continue from the section they chose, as a native jump would.
      if (!target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
      target.focus({ preventScroll: true });
      locked = true;
      mark(target.id);
      clearTimeout(lockTimer);
      lockTimer = window.setTimeout(unlock, motionAllowed() ? 1000 : 50);
      if ("onscrollend" in window) addEventListener("scrollend", unlock, { once: true });
      sound.play("tick");
    });
  }
}
