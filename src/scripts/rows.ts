// The glow under the mouse on the section rows (home and start screen): the row records
// where the pointer is, and the CSS lights a soft spot there. Without this the rows still
// highlight as a whole; the spot just sits at its default place.
import { sound } from "./sound";

const rows = document.querySelectorAll<HTMLElement>(".dash-rows a, .entries .entry");

for (const row of rows) {
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
