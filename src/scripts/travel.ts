// Page travel, the arriving half: the cursor block leaves the link you used and glides onto
// the new page's title, so a click reads as one cursor moving through the site instead of one
// page replacing another. The title's own cursor stays hidden (html[data-travel], set by the
// inline script in Base.astro) until the smear lands. Without this file pages just open.
// Imported after headings.ts, which puts the cursor on a letter of the title.
import { sound } from "./sound";
import { boxOf, motionAllowed, smearTo } from "./smear";
import { KEY, remember } from "./journey";

const root = document.documentElement;
const FAR = 250; // px: a longer flight uses the quicker smear, so it never takes more than about 300ms

document.addEventListener("click", (event) => {
  if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  const link = (event.target as Element).closest?.<HTMLAnchorElement>("a[href]");
  if (!link || link.target || link.hasAttribute("download") || link.origin !== location.origin || link.pathname === location.pathname || link.closest(".lang")) return;
  remember(link);
});

async function arrive() {
  const done = () => root.removeAttribute("data-travel");
  let saved: { x: number; y: number; w: number; h: number; at: number } | null = null;
  try {
    saved = JSON.parse(sessionStorage.getItem(KEY) ?? "null");
    sessionStorage.removeItem(KEY);
  } catch {
    saved = null;
  }
  const navigation = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
  const title = document.querySelector<HTMLElement>(".page-title");
  const cursor = title?.querySelector<HTMLElement>(".cur");
  if (!saved || Date.now() - saved.at > 2500 || navigation?.type !== "navigate" || !title || !cursor || !motionAllowed() || document.hidden) return done();

  const to = boxOf(cursor);
  // The title rises 10px as it enters: aim at where it will rest, not where it starts.
  to.y -= new DOMMatrix(getComputedStyle(title).transform).m42;
  const from = { x: saved.x, y: saved.y, w: saved.w, h: saved.h };
  const quick = Math.hypot(to.x - from.x, to.y - from.y) > FAR;
  await smearTo(from, to, quick);
  done();
  sound.play("land", { gain: 0.6 });
}

void arrive();
