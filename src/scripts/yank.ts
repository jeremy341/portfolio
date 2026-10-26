// Yank a link: yy (or :yank) copies the address of the section on screen, or of the page when
// it has no sections, says so on the message line, and flashes the heading it copied, the way
// Neovim lights up a yank. Without this file nothing is copied.
import { editor } from "./editor";
import { sound } from "./sound";
import { langOf, ui } from "../lib/i18n";

/** The last section whose top has passed a third of the way down the screen. */
function sectionOnScreen(): Element | null {
  const line = innerHeight * 0.33;
  let current: Element | null = null;
  for (const section of document.querySelectorAll("main section[id]")) {
    if (section.getBoundingClientRect().top <= line) current = section;
  }
  return current;
}

/** The heading's text in the accent for a moment, then fading out (the page does not move). */
function flash(section: Element | null) {
  if (!("highlights" in CSS)) return;
  const heading = section?.querySelector("h2") ?? document.querySelector(".page-title");
  if (!heading) return;
  const range = new Range();
  range.selectNodeContents(heading);
  CSS.highlights.set("yank", new Highlight(range));
  setTimeout(() => {
    CSS.highlights.delete("yank");
    CSS.highlights.set("yank-fade", new Highlight(range));
  }, 110);
  setTimeout(() => CSS.highlights.delete("yank-fade"), 260);
}

async function yank() {
  const section = sectionOnScreen();
  const url = new URL(location.href);
  url.hash = section ? section.id : "";
  try {
    await navigator.clipboard.writeText(url.href);
    sound.play("confirm");
    flash(section);
    editor.say(`${ui[langOf(document.documentElement.lang)].copied} ${url.pathname}${url.hash}`);
  } catch {
    editor.say("E353: Nothing in register + (the browser blocked the clipboard)", true);
  }
}

let pending = false;
editor.onKey((event) => {
  if (event.key !== "y") {
    pending = false;
    return false;
  }
  if (pending) void yank();
  pending = !pending;
  return true;
});
editor.onCommand("yank", () => void yank());
