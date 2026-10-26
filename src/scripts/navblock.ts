// The hover block in the top bar: one accent block that rests on the link under the pointer
// (or the keyboard focus) and glides to the next one, the same block as under EN / DE. The
// links and the block are plain CSS (global.css, "Hover block"); this file only places it.
// Without it the links keep their old blue hover.
import { sound } from "./sound";

const nav = document.querySelector<HTMLElement>(".site-nav");
const block = nav?.querySelector<HTMLElement>(".nav-cur");

if (nav && block) {
  const links = [...nav.querySelectorAll<HTMLAnchorElement>(":scope > a")];
  let shown = false;
  let current: HTMLElement | null = null;

  const show = (link: HTMLElement) => {
    const fresh = !shown;
    // Coming from nothing, the block lands on the link instead of sliding in from where it last was.
    if (fresh) block.classList.add("snap");
    block.style.width = `${link.offsetWidth}px`;
    block.style.height = `${link.offsetHeight}px`;
    block.style.transform = `translate(${link.offsetLeft}px, ${link.offsetTop}px)`;
    block.toggleAttribute("data-on", true);
    if (fresh) {
      void block.offsetWidth;
      block.classList.remove("snap");
    } else if (link !== current) {
      sound.play("tick", { gain: 0.5 });
    }
    shown = true;
    current = link;
  };

  const hide = () => {
    block.toggleAttribute("data-on", false);
    shown = false;
    current = null;
  };

  nav.setAttribute("data-block", "");
  for (const link of links) {
    link.addEventListener("pointerenter", (event) => {
      if (event.pointerType === "mouse" || event.pointerType === "pen") show(link);
    });
    link.addEventListener("focus", () => {
      if (link.matches(":focus-visible")) show(link);
    });
  }
  nav.addEventListener("pointerleave", hide);
  nav.addEventListener("focusout", (event) => {
    if (!nav.contains(event.relatedTarget as Node | null)) hide();
  });
}
