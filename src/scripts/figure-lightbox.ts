// Full-size figures without leaving the page. Without this file the figure links still open the
// raw image in a new tab, so nothing depends on it being here.
import { langOf, ui } from "../lib/i18n";

const t = ui[langOf(document.documentElement.lang)];
const links = document.querySelectorAll<HTMLAnchorElement>("[data-figure]");

/** The widest srcset entry, so the lightbox gets the biggest responsive WebP, not the thumbnail. */
function largestSrc(image: HTMLImageElement): string {
  let best = image.currentSrc || image.src;
  let width = 0;
  for (const entry of image.srcset.split(",")) {
    const match = entry.trim().match(/^(\S+)\s+(\d+)w$/);
    if (match && Number(match[2]) > width) {
      width = Number(match[2]);
      best = match[1];
    }
  }
  return best;
}

const dialog = document.createElement("dialog");
if (links.length > 0 && typeof dialog.showModal === "function") {
  dialog.className = "figure-lightbox";
  dialog.setAttribute("aria-label", t.figureViewer);
  dialog.setAttribute("data-lenis-prevent", "");

  const caption = document.createElement("p");
  caption.id = "figure-lightbox-caption";
  caption.className = "lb-caption";

  const close = document.createElement("button");
  close.type = "button";
  close.className = "lb-close";
  close.textContent = "×";
  close.setAttribute("aria-label", t.figureClose);
  close.autofocus = true;
  close.addEventListener("click", () => dialog.close());

  const image = document.createElement("img");
  image.className = "lb-img";

  dialog.append(close, image, caption);
  document.body.append(dialog);

  let trigger: HTMLAnchorElement | undefined;
  dialog.addEventListener("close", () => {
    if (dialog.open) return;
    trigger?.focus({ preventScroll: true });
    trigger = undefined;
  });

  // Keep editor shortcuts outside the viewer while leaving Escape to the native dialog.
  dialog.addEventListener("keydown", (event) => event.stopPropagation());

  let pressedBackdrop = false;
  dialog.addEventListener("pointerdown", (event) => {
    pressedBackdrop = event.target === dialog;
  });
  dialog.addEventListener("click", (event) => {
    if (pressedBackdrop && event.target === dialog) dialog.close();
    pressedBackdrop = false;
  });

  for (const link of links) {
    link.setAttribute("aria-haspopup", "dialog");
    link.addEventListener("click", (event) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const images = [...link.querySelectorAll<HTMLImageElement>("img")];
      const visible = images.find((img) => getComputedStyle(img).display !== "none") ?? images[0];
      if (!visible) return;
      event.preventDefault();
      trigger = link;

      caption.textContent = link.closest("figure")?.querySelector("figcaption")?.innerText.trim() ?? "";
      if (caption.textContent) dialog.setAttribute("aria-describedby", caption.id);
      else dialog.removeAttribute("aria-describedby");

      const width = Number(visible.getAttribute("width"));
      const height = Number(visible.getAttribute("height"));
      // Reserve the scaled image box even before the full-size file loads.
      image.style.width = width && height ? `min(${width}px, calc(var(--lb-image-height) * ${width / height}))` : "";
      image.style.aspectRatio = width && height ? `${width} / ${height}` : "";
      image.alt = images.find((img) => img.alt)?.alt ?? "";
      image.src = largestSrc(visible);
      dialog.showModal();
    });
  }
}
