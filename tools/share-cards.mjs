import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";

// Page-specific social cards, rendered as SVG and rasterised by sharp at build time. The look
// follows public/og-card.png: editor path, large title, a short description, a rules line and a
// footer. Everything is read from the built HTML, so the cards follow the content automatically.

const esc = (value) =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

const decode = (value) =>
  String(value)
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");

const match = (html, re) => html.match(re)?.[1];

function wrap(text, maxChars, maxLines) {
  const words = String(text).split(/\s+/).filter(Boolean);
  const lines = [];
  let line = "";
  for (const word of words) {
    if (!line) line = word;
    else if ((line + " " + word).length <= maxChars) line += " " + word;
    else {
      lines.push(line);
      line = word;
    }
  }
  if (line) lines.push(line);
  if (lines.length <= maxLines) return lines;
  const kept = lines.slice(0, maxLines);
  kept[maxLines - 1] = kept[maxLines - 1].slice(0, maxChars - 1) + "…";
  return kept;
}

function svg({ path, title, description, footer }) {
  const titleSize = title.length > 38 ? 46 : title.length > 24 ? 56 : 72;
  const titleChars = Math.floor(1008 / (titleSize * 0.6));
  const titleLines = wrap(title, titleChars, 2);
  const titleY = titleLines.length > 1 ? 208 : 240;
  const titleMarkup = titleLines
    .map((line, i) => `<tspan x="84" y="${titleY + i * (titleSize * 1.16)}">${esc(line)}</tspan>`)
    .join("");
  const summaryY = titleY + titleLines.length * titleSize * 1.16 + 30;
  const summaryMarkup = wrap(description, 66, 3)
    .map((line, i) => `<tspan x="84" y="${summaryY + i * 40}">${esc(line)}</tspan>`)
    .join("");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630" role="img" aria-label="${esc(title)}">
<rect width="1200" height="630" fill="#1a1b26"/>
<text x="84" y="96" fill="#8a93bd" font-family="monospace" font-size="22">${esc(path)}</text>
<text fill="#c0caf5" font-family="monospace" font-size="${titleSize}" font-weight="700">${titleMarkup}</text>
<text fill="#8a93bd" font-family="monospace" font-size="26">${summaryMarkup}</text>
<line x1="84" y1="520" x2="1116" y2="520" stroke="#2f334d" stroke-width="2"/>
<text x="84" y="570" fill="#8a93bd" font-family="monospace" font-size="22">${esc(footer)}</text>
<text x="1116" y="570" fill="#7aa2f7" font-family="monospace" font-size="22" text-anchor="end">EN / DE</text>
</svg>`;
}

/** The part of a page's route used in the card's pseudo-path and output filename. */
function cardName(route, lang) {
  const bare = lang === "de" ? route.replace(/^\/de(?=\/)/, "") : route;
  return bare.replace(/^\/+|\/+$/g, "") || "index";
}

const sectionLabels = {
  en: { work: "Work", blog: "Writing", certificates: "Certificates", about: "About", cv: "CV", contact: "Contact" },
  de: { work: "Projekte", blog: "Blog", certificates: "Zertifikate", about: "Über mich", cv: "Lebenslauf", contact: "Kontakt" },
};

function footerFor(html, route, lang) {
  const record = html.match(/<dl class="record">([\s\S]*?)<\/dl>/)?.[1] ?? "";
  const values = [...record.matchAll(/<dd[^>]*>([\s\S]*?)<\/dd>/g)].map((m) => decode(m[1].replace(/<[^>]*>/g, "")));
  if (values.length >= 2 && route.includes("/work/")) return `${values[1]} / ${values[0]}`;
  const published = match(html, /<meta property="article:published_time" content="([^"]+)"/);
  if (published && route.includes("/blog/")) return `${sectionLabels[lang].blog} / ${published}`;
  const key = route.replace(/^\/de(?=\/)/, "").replace(/^\/+|\/+$/g, "").split("/")[0];
  const label = sectionLabels[lang][key] ?? "Jeremy Darko";
  return `${label} / Jeremy Darko`;
}

export function shareCards() {
  return {
    name: "share-cards",
    hooks: {
      "astro:build:done": async ({ dir }) => {
        const { default: sharp } = await import("sharp");
        let count = 0;
        for (const [route, lang] of routes(dir)) {
          if (route === "/" || route === "/de/") continue; // home keeps its hand-made card
          const html = readFileSync(new URL(`.${route}index.html`, dir), "utf8");
          if (html.includes('http-equiv="refresh"')) continue;

          const title = decode(match(html, /<title>([^<]*)<\/title>/) ?? "").replace(/ \| Jeremy Darko$/, "");
          const description = decode(match(html, /<meta name="description" content="([^"]*)"/) ?? "");
          if (!title || !description) continue;

          const name = cardName(route, lang);
          const flat = name.replace(/\//g, "-");
          const pseudo = `~/jeremy-darko/${lang === "de" ? "de/" : ""}${name}.md`;
          const output = new URL(`og/${lang}/${flat}.png`, dir);
          mkdirSync(new URL("og/", dir), { recursive: true });
          mkdirSync(new URL(`og/${lang}/`, dir), { recursive: true });
          const png = await sharp(Buffer.from(svg({ path: pseudo, title, description, footer: footerFor(html, route, lang) })))
            .png()
            .toBuffer();
          writeFileSync(fileURLToPath(output), png);

          // The PNGs in public/og/ are committed. Fail the build when they drift from what the
          // content now generates, so a renamed title cannot leave a stale share card behind.
          const committed = fileURLToPath(new URL(`../public/og/${lang}/${flat}.png`, import.meta.url));
          if (existsSync(committed) && !readFileSync(committed).equals(png)) {
            throw new Error(`share-cards: ${committed} is stale; regenerate the committed share cards`);
          }
          count++;
        }
        console.log(`share-cards: wrote ${count} page-specific social cards`);
      },
    },
  };
}

/** Built HTML routes and their language, discovered from dist. */
function* routes(dir) {
  function* walk(folder, prefix) {
    for (const entry of readdirSync(folder)) {
      const full = join(folder, entry);
      if (statSync(full).isDirectory()) yield* walk(full, `${prefix}${entry}/`);
      else if (entry === "index.html") yield [`/${prefix}`, prefix.startsWith("de/") ? "de" : "en"];
    }
  }
  yield* walk(fileURLToPath(dir), "");
}
