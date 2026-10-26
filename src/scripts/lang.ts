// The EN / DE switch (Header.astro), the sound and the arriving half of its animation.
// Leaving: the switch is a plain link, so it works without this file; here it only clicks and
// notes the moment (the inline script in Base.astro reads it on the next page). The block
// under EN / DE glides to the other letter on its own, as a shared view transition (CSS).
// Arriving: the title of the new page is overwritten letter by letter in the new language,
// Neovim's Replace mode, with the same taps as the home hero. Imported after headings.ts,
// which splits the title into letters.
import { editor } from "./editor";
import { sound } from "./sound";
import { motionAllowed } from "./smear";

const KEY = "jd:lang";
const root = document.documentElement;
const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

document.addEventListener("click", (event) => {
  if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  const link = (event.target as Element).closest?.<HTMLAnchorElement>(".lang a");
  if (!link || link.getAttribute("aria-current") === "true") return;
  try {
    sessionStorage.setItem(KEY, String(Date.now()));
  } catch {
    // Private mode: the page still switches, only the retyping is skipped.
  }
  sound.play("swish");
});

async function retype() {
  const done = () => root.removeAttribute("data-retype");
  let flip = 0;
  try {
    flip = Number(sessionStorage.getItem(KEY));
    sessionStorage.removeItem(KEY);
  } catch {
    flip = 0;
  }
  const navigation = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
  const letters = [...document.querySelectorAll<HTMLElement>(".page-title .ht")];
  if (!flip || Date.now() - flip > 2500 || navigation?.type !== "navigate" || !letters.length || !motionAllowed() || document.hidden) return done();

  // The title was held back (html[data-retype]); show its frame with the letters still blank.
  const cursor = letters.find((letter) => letter.classList.contains("cur"));
  cursor?.classList.remove("cur");
  for (const letter of letters) letter.style.color = "transparent";
  letters[0].classList.add("ul");
  done();
  editor.setMode("REPLACE");
  sound.play("open", { gain: 0.6 });

  const pace = Math.min(40, 520 / letters.length);
  await wait(120);
  for (let i = 0; i < letters.length; i++) {
    letters[i].style.removeProperty("color");
    letters[i].classList.remove("ul");
    letters[i + 1]?.classList.add("ul");
    sound.play("type", { pitch: 0.9 + Math.min(i, 12) * 0.035 });
    await wait(pace);
  }
  editor.setMode(null);
  cursor?.classList.add("cur");
  sound.play("thock", { gain: 0.7 });
}

void retype();
