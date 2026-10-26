import Lenis from "lenis";

// Smooth, inertial page scrolling, the same Lenis setup as the loadout site. It is off for
// visitors who ask for reduced motion, and it follows the setting if they change it while the page is open.
// Scroll areas inside the page opt out with data-lenis-prevent, so they keep their own scrolling.
const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
let lenis: Lenis | undefined;
let frame = 0;

function stop() {
  cancelAnimationFrame(frame);
  lenis?.destroy();
  lenis = undefined;
}

function start() {
  stop();
  if (preference.matches) return;
  lenis = new Lenis({ anchors: { offset: -24 }, duration: 0.7 });
  const raf = (time: number) => {
    lenis?.raf(time);
    frame = requestAnimationFrame(raf);
  };
  frame = requestAnimationFrame(raf);
}

start();
preference.addEventListener("change", start);
