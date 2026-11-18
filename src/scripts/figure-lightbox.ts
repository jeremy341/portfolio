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

  const close = document.createElement("button");
  close.type = "button";
  close.className = "lb-close";
  close.textContent = "×";
  close.setAttribute("aria-label", t.figureClose);
  close.autofocus = true;
  close.addEventListener("click", () => dialog.close());

  const image = document.createElement("img");
  image.className = "lb-img";
  const stage = document.createElement("div");
  stage.className = "lb-stage";
  stage.append(image);

  const caption = document.createElement("p");
  caption.id = "figure-lightbox-caption";
  caption.className = "lb-caption";
  const captionText = document.createElement("span");
  const hint = document.createElement("span");
  hint.className = "lb-zoom-hint";
  hint.textContent = ` · ${t.figureZoom}`;
  caption.append(captionText, hint);

  dialog.append(close, stage, caption);
  document.body.append(dialog);

  let zoomed = false;
  function setZoom(on: boolean) {
    zoomed = on;
    dialog.classList.toggle("is-zoomed", on);
    hint.textContent = ` · ${on ? t.figureFit : t.figureZoom}`;
    stage.scrollLeft = 0;
    stage.scrollTop = 0;
    if (on) {
      requestAnimationFrame(() => {
        stage.scrollLeft = Math.max(0, (image.offsetWidth - stage.clientWidth) / 2);
        stage.scrollTop = Math.max(0, (image.offsetHeight - stage.clientHeight) / 2);
      });
    }
  }
  image.addEventListener("click", () => setZoom(!zoomed));

  let trigger: HTMLAnchorElement | undefined;
  dialog.addEventListener("close", () => {
    if (dialog.open) return;
    setZoom(false);
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

      captionText.textContent = link.closest("figure")?.querySelector("figcaption")?.innerText.trim() ?? "";
      if (captionText.textContent) dialog.setAttribute("aria-describedby", caption.id);
      else dialog.removeAttribute("aria-describedby");

      image.alt = images.find((img) => img.alt)?.alt ?? "";
      image.src = largestSrc(visible);
      setZoom(false);
      dialog.showModal();
    });
  }
}
