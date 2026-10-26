// Page travel, the leaving half: the page you are on remembers where its cursor was (the
// first letter of the link you used) so the next page's title can receive it (travel.ts).
// Shared by the scripts that open pages with a key. Without it pages simply load.
import type { Box } from "./smear";

export const KEY = "travel";

/** The box of the first letter of an element's text, which is where its cursor block sits. */
export function startOf(element: Element): Box | null {
  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    const text = node as Text;
    const index = text.data.search(/\S/);
    if (index < 0) continue;
    const range = document.createRange();
    range.setStart(text, index);
    range.setEnd(text, index + 1);
    const r = range.getBoundingClientRect();
    if (r.width) return { x: r.left, y: r.top, w: r.width, h: r.height };
  }
  return null;
}

/** Notes the link (or the part of it that carries the cursor) as where the next page starts. */
export function remember(link: Element | null) {
  if (!link) return;
  const mark = link.querySelector(".dash-l, .lc, .entry-name, .pager-t, .f-name") ?? link;
  const box = startOf(mark);
  if (!box) return;
  try {
    sessionStorage.setItem(KEY, JSON.stringify({ ...box, at: Date.now() }));
  } catch {
    // Private mode: the pages still open, the cursor just does not travel.
  }
}

/** For a key that opens a page by address: finds the link on screen that points there. */
export function rememberHref(href: string) {
  remember(document.querySelector(`main a[href="${href}"], .site-nav a[href="${href}"]`));
}
