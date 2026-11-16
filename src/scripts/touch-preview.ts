// Touch previews have their own button: the link itself keeps its normal navigation.
import { langOf, ui } from "../lib/i18n";
import { previewFor } from "./link-preview";
import { motionAllowed } from "./smear";

const touch = matchMedia("(any-pointer: coarse), (hover: none)");
const t = ui[langOf(document.documentElement.lang)].preview;
const dialog = document.createElement("dialog");
dialog.className = "preview-sheet";
dialog.id = "touch-preview";
dialog.setAttribute("aria-labelledby", "preview-title");
dialog.setAttribute("aria-describedby", "preview-summary");
dialog.setAttribute("data-lenis-prevent", "");
const close = document.createElement("button");
close.type = "button";
close.className = "preview-close";
close.textContent = t.close;
close.autofocus = true;
const image = document.createElement("img");
image.alt = "";
const title = document.createElement("h2");
title.id = "preview-title";
const summary = document.createElement("p");
summary.id = "preview-summary";
const open = document.createElement("a");
open.className = "preview-open";
open.textContent = t.open;
dialog.append(close, image, title, summary, open);
let trigger: HTMLButtonElement | undefined;
let previousOverflow = "";
let animation: Animation | undefined;
let closing = false;

function dismiss() {
  if (!dialog.open || closing) return;
  closing = true;
  animation?.cancel();
  if (!motionAllowed()) { dialog.close(); return; }
  animation = dialog.animate([{ transform: "translateY(0)", opacity: 1 }, { transform: "translateY(24px)", opacity: 0 }],
    { duration: 160, easing: "cubic-bezier(0.32, 0.72, 0, 1)" });
  void animation.finished.then(() => dialog.close()).catch(() => {});
}

close.addEventListener("click", dismiss);
// Keep editor shortcuts and the search shortcut out of the modal's keyboard scope.
dialog.addEventListener("keydown", (event) => event.stopPropagation());
dialog.addEventListener("cancel", (event) => { event.preventDefault(); dismiss(); });
let backdropPress = false;
function outside(event: PointerEvent) {
  const box = dialog.getBoundingClientRect();
  return event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom;
}
dialog.addEventListener("pointerdown", (event) => { backdropPress = outside(event); });
dialog.addEventListener("pointerup", (event) => {
  if (backdropPress && outside(event)) dismiss();
  backdropPress = false;
});
dialog.addEventListener("close", () => {
  animation?.cancel();
  closing = false;
  document.body.style.overflow = previousOverflow;
  trigger?.setAttribute("aria-expanded", "false");
  trigger?.focus({ preventScroll: true });
});
image.addEventListener("error", () => { image.hidden = true; });

function sync() {
  if (!touch.matches) {
    if (dialog.open) dialog.close();
    document.querySelectorAll(".preview-trigger").forEach((button) => button.remove());
    return;
  }
  if (!dialog.isConnected) document.body.append(dialog);
  const links = document.querySelectorAll<HTMLAnchorElement>("main .prose a[href], main .story-copy a[href], main .work-story-intro a[href], main .block a[href]");
  for (const anchor of links) {
    const preview = previewFor(anchor);
    if (!preview || anchor.nextElementSibling?.classList.contains("preview-trigger")) continue;
    const button = document.createElement("button");
    button.type = "button";
    button.className = "preview-trigger";
    button.textContent = "[i]";
    button.setAttribute("aria-label", t.button(preview.title));
    button.setAttribute("aria-haspopup", "dialog");
    button.setAttribute("aria-controls", dialog.id);
    button.setAttribute("aria-expanded", "false");
    button.addEventListener("click", () => {
      if (dialog.open) return;
      trigger = button;
      button.setAttribute("aria-expanded", "true");
      title.textContent = preview.title;
      summary.textContent = preview.text;
      image.hidden = !preview.image;
      if (preview.image) image.src = preview.image;
      else image.removeAttribute("src");
      open.href = anchor.href;
      open.target = anchor.origin === location.origin ? "" : "_blank";
      open.rel = "noopener";
      previousOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      dialog.showModal();
      if (motionAllowed()) animation = dialog.animate(
        [{ transform: "translateY(24px)", opacity: 0 }, { transform: "translateY(0)", opacity: 1 }],
        { duration: 220, easing: "cubic-bezier(0.32, 0.72, 0, 1)" });
    });
    anchor.after(button);
  }
}
touch.addEventListener("change", sync);
sync();
