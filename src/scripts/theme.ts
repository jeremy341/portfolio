// Light and dark mode. The head script in Base.astro sets the theme before the first paint; this
// file keeps the top-bar and status-line switches and `:set light` / `:set dark` in step with it.

import { sound } from "./sound";
import { langOf, ui } from "../lib/i18n";

export type Theme = "light" | "dark";

const STORE = "jd:theme";
const root = document.documentElement;
const buttons = [...document.querySelectorAll<HTMLButtonElement>("[data-theme-switch]")];
const t = ui[langOf(root.lang)];

function current(): Theme {
  return root.dataset.theme === "light" ? "light" : "dark";
}

// The label names what a press does: on a dark page it offers light mode, and the reverse.
function paint() {
  const label = current() === "light" ? t.themeDark : t.themeLight;
  for (const button of buttons) button.textContent = label;
}

export function setTheme(theme: Theme) {
  root.dataset.theme = theme;
  try {
    localStorage.setItem(STORE, theme);
  } catch {
    // Not persisted; the theme still changes for this page.
  }
  paint();
}

for (const button of buttons) {
  button.addEventListener("click", () => {
    sound.play("tick");
    setTheme(current() === "light" ? "dark" : "light");
  });
}

paint();
