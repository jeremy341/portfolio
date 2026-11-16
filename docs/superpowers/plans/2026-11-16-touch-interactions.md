# Touch Interactions Implementation Plan

**Goal:** Bring previews, heading feedback and row feedback to touch devices.

**Architecture:** Share preview lookup with a separate touch preview controller. Extend existing heading and row controllers rather than duplicate them. Use a native dialog and scoped CSS.

**Tech Stack:** Astro, TypeScript, CSS, Web Animations API.

**Spec:** docs/superpowers/specs/2026-11-16-touch-interactions-design.md

## Global constraints

No new dependencies. Preserve normal links, scrolling, selection and desktop interactions. Localize English/German controls and honor reduced motion.

## Review focus

Keyboard focus and Escape; cancellation during scrolling; resizing or hybrid pointer changes; missing preview images; reduced motion.

## Tasks

- [x] Export preview lookup and implement a localized native touch preview sheet with separate buttons.
- [x] Add completed-touch heading ripple through the existing heading controller.
- [x] Add row press feedback and cancellation through the existing row controller.
- [x] Check types and build/site tests; exercise interactions headlessly at phone, tablet and desktop sizes, capture screenshots, and inspect the final diff.

## Evidence

`npm run check`: zero errors, warnings or hints. `npm test`: build and 44 tests passed.
Headless Chromium touch checks at 390x844 and 820x1180 verified modal opening, target URL, Close/Escape/backdrop dismissal, focus return, keyboard scope, German labels, heading ripple, reduced motion and row press/scroll cancellation. Desktop at 1440x1000 retained hover previews and had no touch buttons. No page errors. A separate read-only reviewer found no actionable regressions.

Ruling: Native dialog Tab navigation may pass through browser chrome; it must keep the underlying page inert, rather than manually trapping browser chrome.

The follow-up homepage ripple reuses the heading tap helper. Touch checks at 390px and 820px verified cursor movement, stable letter width, scroll cancellation and reduced motion; existing preview and heading checks remained green.

Physical device feel and screen reader speech remain unverified. The user subsequently requested one commit and a push containing these changes.
