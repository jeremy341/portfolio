// The project page: the outline on the left follows the section on screen (outline.ts), and
// [ and ] step to the previous and next project. Without this file the pager is plain links.
import "./outline";
import { editor } from "./editor";
import { sound } from "./sound";
import { remember } from "./journey";

editor.onKey((event) => {
  if (event.key !== "]" && event.key !== "[") return false;
  const link = document.querySelector<HTMLAnchorElement>(event.key === "]" ? "[data-next]" : "[data-prev]");
  if (!link) return false;
  sound.play("confirm");
  remember(link);
  location.assign(link.href);
  return true;
});
