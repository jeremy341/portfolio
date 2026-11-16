// The glow under the mouse on the section rows (home and start screen): the row records
// where the pointer is, and the CSS lights a soft spot there. Without this the rows still
// highlight as a whole; the spot just sits at its default place.
import { sound } from "./sound";

const rows = document.querySelectorAll<HTMLElement>(".dash-rows a, .entries .entry");

let pressed: { row: HTMLElement; id: number; x: number; y: number } | undefined;
const release = () => {
  pressed?.row.removeAttribute("data-pressed");
  pressed = undefined;
};
document.addEventListener("pointermove", (event) => {
  if (pressed && event.pointerId === pressed.id && Math.hypot(event.clientX - pressed.x, event.clientY - pressed.y) > 10) release();
}, { passive: true });
document.addEventListener("pointerup", release, { passive: true });
document.addEventListener("pointercancel", release, { passive: true });
window.addEventListener("scroll", release, { passive: true });
window.addEventListener("blur", release);
window.addEventListener("pagehide", release);

for (const row of rows) {
  row.addEventListener("pointerdown", (event) => {
    if (event.pointerType !== "touch" || !event.isPrimary) return;
    release();
    pressed = { row, id: event.pointerId, x: event.clientX, y: event.clientY };
    row.setAttribute("data-pressed", "");
  }, { passive: true });
  let left = 0;
  let frame = 0;
  let x = 0;
  const paint = () => {
    frame = 0;
    row.style.setProperty("--mx", `${x - left}px`);
  };
  row.addEventListener("pointerenter", (event) => {
    if (event.pointerType !== "mouse") return;
    left = row.getBoundingClientRect().left;
    if (row.closest(".dash-rows, .entries")) sound.play("tick", { gain: 0.6 });
  });
  row.addEventListener("pointermove", (event) => {
    if (event.pointerType !== "mouse") return;
    x = event.clientX;
    if (!frame) frame = requestAnimationFrame(paint);
  });
}
