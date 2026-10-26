// Small synthesized clicks for the editor chrome. There are no audio files: every sound is a
// few oscillator and noise nodes, built when it plays. The audio context is only created by a
// click, tap or key press (browsers refuse it earlier; see the end of the listeners below for
// the one exception: a page the browser already knows was clicked), and a sound is dropped unless the
// context is running, so nothing ever queues up and bursts out later. A button in the status
// line (and :set nosound) turns it all off; the choice is remembered.

export type Sound = "tick" | "thock" | "open" | "confirm" | "error" | "swish" | "land" | "type";

interface Options {
  pitch?: number;
  gain?: number;
}

const STORE = "jd:sound";
const MASTER = 0.5;
// Shortest time between two plays of the same sound, in seconds, so a fast sweep stays a rustle.
const GAP: Record<Sound, number> = { tick: 0.04, thock: 0.03, open: 0.1, confirm: 0.1, error: 0.15, swish: 0.1, land: 0.08, type: 0.03 };

type WebkitWindow = Window & { webkitAudioContext?: typeof AudioContext };

const noises = new WeakMap<BaseAudioContext, AudioBuffer>();

function noiseBuffer(ctx: BaseAudioContext) {
  let buffer = noises.get(ctx);
  if (!buffer) {
    buffer = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * 0.25), ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    noises.set(ctx, buffer);
  }
  return buffer;
}

/** A burst of filtered noise: the click of a key. */
function burst(ctx: BaseAudioContext, out: AudioNode, t: number, v: { freq: number; to?: number; q: number; decay: number; gain: number }) {
  const source = ctx.createBufferSource();
  source.buffer = noiseBuffer(ctx);
  const filter = ctx.createBiquadFilter();
  filter.type = "bandpass";
  filter.Q.value = v.q;
  filter.frequency.setValueAtTime(v.freq, t);
  if (v.to) filter.frequency.exponentialRampToValueAtTime(v.to, t + v.decay);
  const amp = ctx.createGain();
  amp.gain.setValueAtTime(v.gain, t);
  amp.gain.exponentialRampToValueAtTime(0.0001, t + v.decay);
  source.connect(filter).connect(amp).connect(out);
  source.start(t);
  source.stop(t + v.decay + 0.02);
}

/** A short falling tone: the body of the click. */
function tone(ctx: BaseAudioContext, out: AudioNode, t: number, v: { freq: number; to: number; decay: number; gain: number; type?: OscillatorType }) {
  const osc = ctx.createOscillator();
  osc.type = v.type ?? "sine";
  osc.frequency.setValueAtTime(v.freq, t);
  osc.frequency.exponentialRampToValueAtTime(v.to, t + v.decay);
  const amp = ctx.createGain();
  amp.gain.setValueAtTime(0.0001, t);
  amp.gain.linearRampToValueAtTime(v.gain, t + 0.002);
  amp.gain.exponentialRampToValueAtTime(0.0001, t + v.decay);
  osc.connect(amp).connect(out);
  osc.start(t);
  osc.stop(t + v.decay + 0.02);
}

/** Builds one sound at time t on any audio context, so it can also be rendered offline. */
export function voice(name: Sound, ctx: BaseAudioContext, out: AudioNode, t: number, p = 1, g = 1) {
  switch (name) {
    case "tick":
      burst(ctx, out, t, { freq: 3400 * p, q: 1.4, decay: 0.02, gain: 0.55 * g });
      tone(ctx, out, t, { freq: 1500 * p, to: 1000 * p, decay: 0.03, gain: 0.1 * g });
      break;
    case "thock":
      burst(ctx, out, t, { freq: 1000 * p, q: 0.9, decay: 0.035, gain: 0.5 * g });
      tone(ctx, out, t, { freq: 230 * p, to: 120 * p, decay: 0.07, gain: 0.35 * g });
      break;
    case "open":
      burst(ctx, out, t, { freq: 2600 * p, q: 1.2, decay: 0.025, gain: 0.45 * g });
      tone(ctx, out, t, { freq: 620 * p, to: 420 * p, decay: 0.08, gain: 0.2 * g, type: "triangle" });
      break;
    case "confirm":
      burst(ctx, out, t, { freq: 3000 * p, q: 1.3, decay: 0.02, gain: 0.45 * g });
      tone(ctx, out, t, { freq: 880 * p, to: 820 * p, decay: 0.09, gain: 0.13 * g });
      tone(ctx, out, t + 0.06, { freq: 1320 * p, to: 1240 * p, decay: 0.1, gain: 0.13 * g });
      break;
    case "error":
      burst(ctx, out, t, { freq: 500 * p, q: 0.8, decay: 0.05, gain: 0.3 * g });
      tone(ctx, out, t, { freq: 170 * p, to: 85 * p, decay: 0.16, gain: 0.4 * g, type: "triangle" });
      break;
    case "swish":
      burst(ctx, out, t, { freq: 1800 * p, to: 500 * p, q: 0.7, decay: 0.11, gain: 0.22 * g });
      break;
    case "land":
      burst(ctx, out, t, { freq: 1800 * p, q: 1, decay: 0.012, gain: 0.25 * g });
      tone(ctx, out, t, { freq: 340 * p, to: 220 * p, decay: 0.06, gain: 0.22 * g });
      break;
    case "type":
      burst(ctx, out, t, { freq: 4200 * p, q: 1.6, decay: 0.014, gain: 0.5 * g });
      tone(ctx, out, t, { freq: 1900 * p, to: 1400 * p, decay: 0.025, gain: 0.08 * g });
      break;
  }
}

let on = true;
try {
  on = localStorage.getItem(STORE) !== "off";
} catch {
  // Storage can be blocked; the sound then stays on for this page.
}

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
const last = new Map<Sound, number>();

/** Creates (or wakes) the audio context. Browsers only allow this inside a user gesture. */
function unlock() {
  if (!on) return;
  if (!ctx) {
    const Context = window.AudioContext ?? (window as WebkitWindow).webkitAudioContext;
    if (!Context) return;
    ctx = new Context({ latencyHint: "interactive" });
    master = ctx.createGain();
    master.gain.value = MASTER;
    master.connect(ctx.destination);
  }
  if (ctx.state === "suspended") void ctx.resume();
}

for (const type of ["pointerdown", "keydown", "touchend"]) {
  addEventListener(type, unlock, { capture: true, passive: true });
}

// Hovering is not a gesture, so on a page nobody has clicked yet the hover ticks stay silent.
// Where the browser remembers an earlier click on this site (Chrome and Edge carry it over to
// the next page), the context can start straight away, so the first hover already sounds.
if (navigator.userActivation?.hasBeenActive) unlock();

export const sound = {
  play(name: Sound, { pitch = 1, gain = 1 }: Options = {}) {
    if (!on || !ctx || !master || ctx.state !== "running" || document.hidden) return;
    const now = ctx.currentTime;
    if (now - (last.get(name) ?? -1) < GAP[name]) return;
    last.set(name, now);
    voice(name, ctx, master, now, pitch * (0.97 + Math.random() * 0.06), gain);
  },
  enabled: () => on,
  /** Turns the sound on or off and remembers it. Call from a click or key press. */
  set(next: boolean) {
    on = next;
    try {
      localStorage.setItem(STORE, next ? "on" : "off");
    } catch {
      // Not persisted; fine.
    }
    unlock();
  },
};
