// Tells IndexNow (Bing, Yandex and others) that the pages in the built sitemap have changed.
// Run it by hand after a deploy, or after publishing an article: `node tools/indexnow.mjs`.
// The key file in public/ proves that the site owns the host, so it is served at /<key>.txt.
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const host = "jeremydarko.me";
const keyFile = readdirSync("public").find((name) => /^[a-f0-9]{32}\.txt$/.test(name));
if (!keyFile) throw new Error("No IndexNow key file in public/.");
const key = readFileSync(join("public", keyFile), "utf8").trim();
const sitemap = readFileSync("dist/sitemap.xml", "utf8");
const urlList = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);

const response = await fetch("https://api.indexnow.org/indexnow", {
  method: "POST",
  headers: { "Content-Type": "application/json; charset=utf-8" },
  body: JSON.stringify({ host, key, keyLocation: `https://${host}/${keyFile}`, urlList }),
});
console.log(`IndexNow answered ${response.status} for ${urlList.length} URLs.`);
