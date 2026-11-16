import { motionAllowed } from "./smear";

/** Decorative letter feedback for completed taps, without capturing native gestures. */
export function touchRipple(element: HTMLElement, letters: HTMLElement[], base: number, enabled = () => true) {
  let start: { id: number; x: number; y: number; at: number } | null = null;
  const ripples = new Map<HTMLElement, Animation>();
  element.addEventListener("pointerdown", (event) => {
    if (event.pointerType !== "touch" || !event.isPrimary || !enabled() || (event.target as Element).closest("a, button")) return;
    start = { id: event.pointerId, x: event.clientX, y: event.clientY, at: performance.now() };
  });
  element.addEventListener("pointermove", (event) => {
    if (start && Math.hypot(event.clientX - start.x, event.clientY - start.y) > 10) start = null;
  });
  element.addEventListener("pointercancel", () => { start = null; });
  element.addEventListener("pointerup", (event) => {
    const tap = start;
    start = null;
    if (!tap || tap.id !== event.pointerId || performance.now() - tap.at > 500 ||
      Math.hypot(event.clientX - tap.x, event.clientY - tap.y) > 10 ||
      !getSelection()?.isCollapsed || !enabled() || !motionAllowed()) return;
    const index = letters.findIndex((letter) => letter.contains(event.target as Node));
    if (index < 0) return;
    letters.forEach((cell, i) => {
      const distance = Math.abs(i - index);
      if (distance > 5) return;
      ripples.get(cell)?.cancel();
      const ripple = cell.animate([
        { fontWeight: base },
        { fontWeight: Math.max(100, base - 470 * (1 - distance / 6)), offset: 0.35 },
        { fontWeight: base },
      ], { duration: 260, delay: distance * 14, easing: "cubic-bezier(0.23, 1, 0.32, 1)" });
      ripples.set(cell, ripple);
      void ripple.finished.then(() => { if (ripples.get(cell) === ripple) ripples.delete(cell); }).catch(() => {});
    });
  });
}
