// A small card that shows a project's or an article's title and summary when you hover a link to it,
// like the previews on Wikipedia. Only links to projects and articles get one, and only on devices with a mouse.
type Preview = { title: string; text: string; image?: string };

const data = document.getElementById("link-previews");
const previews: Record<string, Preview> = data ? JSON.parse(data.textContent ?? "{}") : {};

if (window.matchMedia("(hover: hover)").matches && Object.keys(previews).length > 0) {
  const card = document.createElement("div");
  card.className = "link-preview";
  card.hidden = true;
  card.setAttribute("aria-hidden", "true");
  const image = document.createElement("img");
  image.alt = "";
  image.loading = "lazy";
  // The card's height changes when the picture arrives, so move it again to keep it above the link.
  image.addEventListener("load", () => {
    if (link) place(link);
  });
  const heading = document.createElement("strong");
  const summary = document.createElement("p");
  card.append(image, heading, summary);
  document.body.append(card);

  let link: HTMLAnchorElement | undefined;
  let timer = 0;

  // The preview for a link, or undefined when it has none. Links on this site match by path,
  // links elsewhere by their origin and path.
  function previewFor(anchor: HTMLAnchorElement): Preview | undefined {
    const target = new URL(anchor.href, location.href);
    const key = target.origin === location.origin ? target.pathname : `${target.origin}${target.pathname}`;
    return previews[key];
  }

  // Above the link, or below it when there is no room above.
  function place(anchor: HTMLAnchorElement) {
    const box = anchor.getBoundingClientRect();
    const left = Math.min(Math.max(8, box.left), window.innerWidth - card.offsetWidth - 8);
    const above = box.top - card.offsetHeight - 8;
    card.style.left = `${left}px`;
    card.style.top = `${above >= 8 ? above : box.bottom + 8}px`;
  }

  function show(anchor: HTMLAnchorElement) {
    const preview = previewFor(anchor);
    if (!preview) return;
    link = anchor;
    heading.textContent = preview.title;
    summary.textContent = preview.text;
    image.hidden = !preview.image;
    if (preview.image) image.src = preview.image;
    card.hidden = false;
    place(anchor);
  }

  function hide() {
    window.clearTimeout(timer);
    link = undefined;
    card.hidden = true;
  }

  document.addEventListener("pointerover", (event) => {
    const anchor = (event.target as Element).closest<HTMLAnchorElement>("a[href]");
    if (!anchor || anchor === link) return;
    window.clearTimeout(timer);
    timer = window.setTimeout(() => show(anchor), 250);
  });

  document.addEventListener("pointerout", (event) => {
    const anchor = (event.target as Element).closest("a[href]");
    if (anchor && anchor === link) hide();
    else window.clearTimeout(timer);
  });

  document.addEventListener("focusin", (event) => {
    const anchor = (event.target as Element).closest<HTMLAnchorElement>("a[href]");
    if (anchor) show(anchor);
  });
  document.addEventListener("focusout", hide);
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") hide();
  });
  window.addEventListener("scroll", hide, { passive: true });
}
