// The menu is native <details>, so it already works without JS.
// Close it on Escape, outside taps and when switching to desktop.
const menu = document.querySelector<HTMLDetailsElement>(".mobile-nav");
const trigger = menu?.querySelector<HTMLElement>("summary");

if (menu && trigger) {
  document.addEventListener("pointerdown", (event) => {
    if (menu.open && !menu.contains(event.target as Node)) menu.open = false;
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && menu.open) {
      menu.open = false;
      trigger.focus();
      event.preventDefault();
    }
  });

  const desktop = matchMedia("(min-width: 760px)");
  desktop.addEventListener("change", () => {
    if (desktop.matches) menu.open = false;
  });
}
