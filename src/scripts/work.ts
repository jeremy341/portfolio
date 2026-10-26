// The category filter on the Work page. The chips narrow the list in place (the numbers
// count again), the choice lives in the address (#ml) so a link can share it, and the
// finder (/) is one key away for anything else. The rows that stay slide up into the gap,
// and the ones that appear fade in. Without this file the full list shows.
import { sound } from "./sound";
import { motionAllowed } from "./smear";
import { langOf, ui } from "../lib/i18n";

const bar = document.querySelector<HTMLElement>("[data-filters]")!;
const note = bar.querySelector<HTMLElement>("[data-filter-note]")!;
const chips = [...bar.querySelectorAll<HTMLButtonElement>(".chip")];
const rows = [...document.querySelectorAll<HTMLElement>(".entries > li")];
const t = ui[langOf(document.documentElement.lang)];
const EASE = "cubic-bezier(0.16, 1, 0.3, 1)";

/** Plays each row from where it was (or from invisible, if it is new) to where it is now. */
function settle(before: Map<HTMLElement, number>) {
  let fresh = 0;
  for (const row of rows) {
    if (row.hidden) continue;
    const was = before.get(row);
    if (was === undefined) {
      row.animate(
        [
          { opacity: 0, transform: "translateY(8px)" },
          { opacity: 1, transform: "none" },
        ],
        { duration: 220, delay: fresh++ * 30, easing: EASE, fill: "backwards" },
      );
      continue;
    }
    const dy = was - row.getBoundingClientRect().top;
    if (Math.abs(dy) > 1) row.animate([{ transform: `translateY(${dy}px)` }, { transform: "none" }], { duration: 240, easing: EASE });
  }
}

function apply(cat: string, noise: boolean) {
  const known = chips.some((chip) => chip.dataset.cat === cat);
  const shown = known ? cat : "all";
  // Where every visible row is now, read before anything changes (the first paint does not animate).
  const before = noise && motionAllowed() ? new Map(rows.filter((row) => !row.hidden).map((row) => [row, row.getBoundingClientRect().top])) : null;
  let visible = 0;
  for (const row of rows) {
    const show = shown === "all" || row.dataset.cat === shown;
    row.hidden = !show;
    if (show) visible++;
  }
  for (const chip of chips) chip.setAttribute("aria-pressed", String(chip.dataset.cat === shown));
  note.textContent = shown === "all" ? "" : t.filterNote(visible, rows.length);
  history.replaceState(null, "", shown === "all" ? location.pathname : `#${shown}`);
  if (before) settle(before);
  if (noise) sound.play("tick");
}

bar.hidden = false;
for (const chip of chips) chip.addEventListener("click", () => apply(chip.dataset.cat!, true));
apply(location.hash.slice(1), false);
