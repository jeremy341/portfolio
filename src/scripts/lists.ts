// The list cursor: on Work, Writing and Contact, j and k move from row to row instead of
// scrolling, and Enter opens the row. It moves real focus, so the rows look and read the
// same as when tabbing, and the page follows. The cursor block sits on the first letter of
// the focused row's name and glides between rows with the same smear as the home page (the
// focus itself moves at once; only the block is drawn travelling). Without this file j and k
// scroll the page and the rows are plain links.
import { editor } from "./editor";
import { sound } from "./sound";
import { boxOf, motionAllowed, smearTo } from "./smear";

const rows = () => [...document.querySelectorAll<HTMLAnchorElement>("main .entry")].filter((row) => !row.closest("[hidden]"));
const block = (row: Element) => row.querySelector<HTMLElement>(".lc");

/** Wraps the first letter of a row's name, which is where the cursor block rests. */
for (const name of document.querySelectorAll<HTMLElement>("main .entry .entry-name")) {
  const walker = document.createTreeWalker(name, NodeFilter.SHOW_TEXT);
  const text = walker.nextNode() as Text | null;
  if (!text?.data) continue;
  const span = document.createElement("span");
  span.className = "lc";
  span.textContent = text.data[0];
  text.data = text.data.slice(1);
  text.before(span);
}

let flight = 0; // counts moves, so only the latest smear hands the block back

editor.onKey((event) => {
  if (event.key !== "j" && event.key !== "k") return false;
  const list = rows();
  if (!list.length) return false;
  const here = list.indexOf(document.activeElement as HTMLAnchorElement);
  const next = here < 0 ? (event.key === "j" ? 0 : list.length - 1) : here + (event.key === "j" ? 1 : -1);
  if (next < 0 || next >= list.length) return true; // the ends stay put; gg and G go further
  const target = list[next];
  const mine = ++flight;
  for (const row of document.querySelectorAll(".entry.fly")) row.classList.remove("fly");
  const flying = here >= 0 && motionAllowed() && !document.hidden;
  if (flying) target.classList.add("fly"); // the block is drawn by the smear until it lands
  target.focus();
  sound.play("tick", { gain: 0.6 });
  if (flying) {
    // Measured after focus, which may have scrolled the page.
    const from = block(list[here]);
    const to = block(target);
    if (from && to) {
      void smearTo(boxOf(from), boxOf(to), true).then(() => {
        if (mine === flight) target.classList.remove("fly");
      });
    } else target.classList.remove("fly");
  }
  return true;
});
