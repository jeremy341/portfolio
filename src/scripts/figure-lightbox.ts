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

if (links.length > 0) {
  const dialog = document.createElement("dialog");
  dialog.className = "figure-lightbox";

  const close = document.createElement("button");
  close.type = "button";
  close.className = "lb-close";
  close.textContent = t.figureClose;
  close.setAttribute("aria-label", t.figureClose);
  close.addEventListener("click", () => dialog.close());

  const image = document.createElement("img");
  image.className = "lb-img";
  const caption = document.createElement("figcaption");
  caption.className = "lb-caption";
  const figure = document.createElement("figure");
  figure.append(image, caption);

  dialog.append(close, figure);
  document.body.append(dialog);

  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) dialog.close();
  });

  for (const link of links) {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      const images = [...link.querySelectorAll<HTMLImageElement>("img")];
      const visible = images.find((img) => getComputedStyle(img).display !== "none") ?? images[0];
      if (!visible) return;
      const alt = images.find((img) => img.alt)?.alt ?? "";

      image.src = largestSrc(visible);
      image.alt = alt;
      caption.textContent = link.closest("figure")?.querySelector("figcaption")?.textContent?.trim() ?? "";
      dialog.setAttribute("aria-label", `${t.figureOpen}: ${alt}`);
      dialog.showModal();
    });
  }
}
