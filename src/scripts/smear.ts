// A cursor smear: the quad between two cursor boxes, drawn with clip-path (no canvas).
// Each corner chases its target; the two corners facing the move run fast and the other
// two lag behind, which stretches the block along the jump, as smear-cursor.nvim does.
// This file keeps the light helpers; the drawing code loads on the first move (smear-draw.ts).

export interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

export const motionAllowed = () => !matchMedia("(prefers-reduced-motion: reduce)").matches;

export function boxOf(element: Element): Box {
  const r = element.getBoundingClientRect();
  return { x: r.left, y: r.top, w: r.width, h: r.height };
}

/** Moves the smear from one cursor box to another. Resolves when it has settled. */
export async function smearTo(from: Box, to: Box, quick = false): Promise<void> {
  if (!motionAllowed()) return;
  const { drawSmear } = await import("./smear-draw");
  return drawSmear(from, to, quick);
}
