// A cursor smear: the quad between two cursor boxes, drawn with clip-path (no canvas).
// Each corner chases its target; the two corners facing the move run fast and the other
// two lag behind, which stretches the block along the jump, as smear-cursor.nvim does.

export interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

type Point = { x: number; y: number };

const LEAD = 0.42;
const TRAIL = 0.22;
// Hover moves are small and frequent, so they get a quicker smear (about 120ms from end to end).
const QUICK_LEAD = 0.75;
const QUICK_TRAIL = 0.5;
const STEP = 17;
const LIMIT = 700;

let layer: HTMLElement | null = null;
let pos: Point[] = [];
let goal: Point[] = [];
let rate: number[] = [];
let frame = 0;
let last = 0;
let carry = 0;
let started = 0;
let waiting: Array<() => void> = [];

export const motionAllowed = () => !matchMedia("(prefers-reduced-motion: reduce)").matches;

const corners = (b: Box): Point[] => [
  { x: b.x, y: b.y },
  { x: b.x + b.w, y: b.y },
  { x: b.x + b.w, y: b.y + b.h },
  { x: b.x, y: b.y + b.h },
];

const middle = (points: Point[]): Point => ({
  x: points.reduce((sum, p) => sum + p.x, 0) / points.length,
  y: points.reduce((sum, p) => sum + p.y, 0) / points.length,
});

export function boxOf(element: Element): Box {
  const r = element.getBoundingClientRect();
  return { x: r.left, y: r.top, w: r.width, h: r.height };
}

function draw() {
  layer!.style.clipPath = `polygon(${pos.map((p) => `${p.x.toFixed(1)}px ${p.y.toFixed(1)}px`).join(",")})`;
}

function tick(now: number) {
  carry += Math.min(now - last, 100);
  last = now;
  while (carry >= STEP) {
    carry -= STEP;
    pos = pos.map((p, i) => ({ x: p.x + (goal[i].x - p.x) * rate[i], y: p.y + (goal[i].y - p.y) * rate[i] }));
  }
  draw();
  const settled = pos.every((p, i) => Math.hypot(goal[i].x - p.x, goal[i].y - p.y) < 0.5);
  if (settled || now - started > LIMIT) {
    layer!.hidden = true;
    frame = 0;
    const done = waiting;
    waiting = [];
    for (const resolve of done) resolve();
    return;
  }
  frame = requestAnimationFrame(tick);
}

/** Moves the smear from one cursor box to another. Resolves when it has settled. */
export function smearTo(from: Box, to: Box, quick = false): Promise<void> {
  if (!motionAllowed()) return Promise.resolve();
  if (!layer) {
    layer = document.createElement("div");
    layer.className = "smear";
    layer.setAttribute("aria-hidden", "true");
    layer.hidden = true;
    document.body.append(layer);
  }
  if (!frame) pos = corners(from);
  goal = corners(to);

  const target = middle(goal);
  const source = frame ? middle(pos) : middle(corners(from));
  const dx = target.x - source.x;
  const dy = target.y - source.y;
  const facing = goal.map((p) => (p.x - target.x) * dx + (p.y - target.y) * dy);
  const cut = [...facing].sort((a, b) => b - a)[1];
  const [lead, trail] = quick ? [QUICK_LEAD, QUICK_TRAIL] : [LEAD, TRAIL];
  rate = facing.map((value) => (value >= cut ? lead : trail));

  layer.hidden = false;
  draw();
  if (!frame) {
    last = performance.now();
    carry = STEP; // the first frame already takes a step, so the block never waits to start
    started = last;
    frame = requestAnimationFrame(tick);
  }
  return new Promise((resolve) => waiting.push(resolve));
}
