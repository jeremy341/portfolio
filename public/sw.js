const CACHE_PREFIX = "jd-portfolio-v";
const CACHE_NAME = `${CACHE_PREFIX}1`;
const ORIGIN = self.location.origin;
const PAGE_PATH = /^\/(?:de\/)?(?:(?:about|blog|certificates|colophon|contact|cv|now|work)\/|(?:blog|work)\/[a-z0-9-]+\/)?$/;
const BUILD_ASSET = /^\/_astro\/[\w.-]+\.(?:css|js|woff2?|png|jpe?g|webp|avif|svg|gif)$/i;
const PUBLIC_IMAGE = /^\/(?:og-card(?:-de)?\.png|apple-touch-icon\.png|favicon(?:-\d+)?\.(?:png|ico|svg)|(?:og|previews)\/(?:[\w-]+\/)*[\w.-]+\.(?:png|jpe?g|webp|avif|svg|gif))$/i;
const NO_INDEX = /\b(?:noindex|none)\b/i;

function eligible(url) {
  return url.origin === ORIGIN && !url.search;
}

function cacheable(response) {
  return response.status === 200 && !response.redirected && response.type !== "opaque" &&
    !NO_INDEX.test(response.headers.get("X-Robots-Tag") ?? "") &&
    !/\b(?:private|no-store)\b/i.test(response.headers.get("Cache-Control") ?? "");
}

function attribute(tag, name) {
  const match = tag.match(new RegExp(`\\s${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`, "i"));
  return match?.[1] ?? match?.[2] ?? match?.[3] ?? "";
}

async function rememberPage(cache, request, response) {
  if (cacheable(response) && /^text\/html\b/i.test(response.headers.get("Content-Type") ?? "")) {
    const head = (await response.clone().text()).split(/<\/head\s*>/i, 1)[0];
    const hidden = [...head.matchAll(/<meta\b[^>]*>/gi)].some(([tag]) =>
      /^(?:robots|googlebot|bingbot)$/i.test(attribute(tag, "name")) && NO_INDEX.test(attribute(tag, "content")),
    );
    if (!hidden) {
      await cache.put(request, response.clone());
      return head;
    }
  }
  if (response.status === 200 || response.status === 404 || response.status === 410) await cache.delete(request);
  return null;
}

async function rememberAsset(cache, request, response) {
  const type = response.headers.get("Content-Type") ?? "";
  if (cacheable(response) && /^(?:image\/|font\/|text\/(?:css|javascript)\b|application\/(?:javascript|font-woff)\b)/i.test(type)) {
    await cache.put(request, response.clone());
  }
}

async function warmPage(cache, url) {
  const response = await fetch(url, { cache: "reload", credentials: "omit", redirect: "error" });
  const head = await rememberPage(cache, url, response);
  if (head === null) return false;

  const assets = new Set();
  for (const [tag] of head.matchAll(/<(?:link|script)\b[^>]*>/gi)) {
    const path = attribute(tag, "src") || attribute(tag, "href");
    if (BUILD_ASSET.test(path)) assets.add(`${ORIGIN}${path}`);
  }
  await Promise.allSettled([...assets].map(async (asset) => {
    if (!await cache.match(asset)) {
      const fresh = await fetch(asset, { credentials: "omit", redirect: "error" });
      await rememberAsset(cache, asset, fresh);
    }
  }));
  return true;
}

self.addEventListener("install", (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    const shareImage = `${ORIGIN}/og-card.png`;
    const [home] = await Promise.all([
      warmPage(cache, `${ORIGIN}/`),
      fetch(shareImage, { credentials: "omit", redirect: "error" }).then((response) => rememberAsset(cache, shareImage, response)),
    ]);
    if (!home || !await cache.match(shareImage)) throw new Error("Offline shell is unavailable");
  })());
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(names.filter((name) => name.startsWith(CACHE_PREFIX) && name !== CACHE_NAME).map((name) => caches.delete(name)));
    await self.clients.claim();
  })());
});

self.addEventListener("message", (event) => {
  if (event.data !== "cache-current-page" || event.source?.type !== "window") return;
  const url = new URL(event.source.url);
  if (!eligible(url) || url.pathname === "/" || !PAGE_PATH.test(url.pathname)) return;
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => warmPage(cache, `${ORIGIN}${url.pathname}`)).catch(() => {}));
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);
  if (request.method !== "GET" || !eligible(url) || request.headers.has("Range")) return;

  if (request.mode === "navigate") {
    if (!PAGE_PATH.test(url.pathname) || /prefetch|prerender/i.test(request.headers.get("Sec-Purpose") ?? "")) return;
    event.respondWith(navigate(request));
  } else if (BUILD_ASSET.test(url.pathname) || PUBLIC_IMAGE.test(url.pathname)) {
    event.respondWith(staticAsset(request));
  }
});

async function cached(request) {
  return caches.open(CACHE_NAME).then((cache) => cache.match(request)).catch(() => undefined);
}

async function navigate(request) {
  let response;
  try {
    response = await fetch(request);
  } catch {
    return await cached(request) ?? offlinePage();
  }
  await caches.open(CACHE_NAME).then((cache) => rememberPage(cache, request, response)).catch(() => {});
  return response;
}

async function staticAsset(request) {
  const hit = await cached(request);
  if (hit) return hit;
  const response = await fetch(request);
  await caches.open(CACHE_NAME).then((cache) => rememberAsset(cache, request, response)).catch(() => {});
  return response;
}

function offlinePage() {
  return new Response(`<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="robots" content="noindex">
  <title>Offline · Jeremy Darko</title>
  <style>
    :root { color-scheme: dark; --bg: #1a1b26; --fg: #c0caf5; --accent: #7aa2f7; }
    @media (prefers-color-scheme: light) {
      :root { color-scheme: light; --bg: #e6e7ed; --fg: #1a1b26; --accent: #2552b8; }
    }
    html { background: var(--bg); color: var(--fg); font: 100%/1.7 ui-monospace, Consolas, monospace; }
    body { margin: 0; }
    main { max-width: 65rem; margin-inline: auto; padding: clamp(1.5rem, 6vw, 4rem); }
    h1 { margin: 0; font-size: clamp(1.75rem, 5vw, 2.75rem); line-height: 1.2; }
    p { max-width: 48ch; margin: 1rem 0; }
    a { color: var(--accent); display: inline-block; padding-block: .25rem; text-underline-offset: .2em; }
    :focus-visible { outline: 2px solid currentColor; outline-offset: 3px; }
    .skip { position: absolute; left: 1rem; top: .5rem; background: var(--bg); }
    .skip:not(:focus) { clip-path: inset(50%); }
  </style>
</head>
<body>
  <a class="skip" href="#main">Skip to content</a>
  <main id="main" tabindex="-1">
    <h1>You’re offline</h1>
    <p>This page isn’t saved on this device. Try again when you’re back online, or return to the home page.</p>
    <a href="/" hreflang="en">Back to home</a>
  </main>
</body>
</html>`, {
    status: 503,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Robots-Tag": "noindex",
    },
  });
}
