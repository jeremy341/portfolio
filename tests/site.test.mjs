// Checks the built site in dist/. Run with `npm test`, which builds first.
import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { renderMarkdown } from "../src/lib/markdown.ts";

const root = fileURLToPath(new URL("..", import.meta.url));
const dist = join(root, "dist");
const page = (path) => readFileSync(join(dist, path), "utf8");

const projects = {
  mira: { name: "MIRA", legacy: "mira", status: "Experiment" },
  torchvk: { name: "TorchVK", legacy: "torch", status: "Early research" },
  poorup: { name: "Poorup", legacy: "poorup", status: "Playable project" },
  "mobilenet-on-fpga": { name: "MobileNet on FPGA", legacy: "fpga", status: "Work in progress" },
  fluidicstudio: { name: "FluidicStudio", legacy: "fluid", status: "Experimental tooling" },
  abivault: { name: "AbiVault", legacy: "abi", status: "Personal project" },
};

// The German status and category words per project, as written in content/de.
const germanStatus = {
  mira: "Experiment",
  torchvk: "Frühe Forschung",
  poorup: "Spielbares Projekt",
  "mobilenet-on-fpga": "In Arbeit",
  fluidicstudio: "Experimentelle Werkzeuge",
  abivault: "Privates Projekt",
};

// Articles share their slug and publication date across languages.
const posts = ["am-i-a-vibe-coder", "am-i-famous-now", "first-blog"];

function htmlFiles(dir) {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) return htmlFiles(full);
    return name.endsWith(".html") ? [full] : [];
  });
}

test("the site is a home page, project pages and articles", () => {
  const expected = [
    "index.html",
    "work/index.html",
    "about/index.html",
    "contact/index.html",
    "certificates/index.html",
    "cv/index.html",
    "blog/index.html",
    "404.html",
    "robots.txt",
    ...Object.keys(projects).map((slug) => `work/${slug}/index.html`),
    ...posts.map((slug) => `blog/${slug}/index.html`),
  ];
  // Every page also exists in German, at the same address under /de/.
  for (const path of expected.filter((p) => p.endsWith("index.html") && p !== "404.html")) {
    expected.push(`de/${path}`);
  }
  expected.push("search.json", "de/search.json", "llms.txt", "llms-full.txt", "og-card.png", "og-card-de.png");
  for (const path of expected) assert.ok(existsSync(join(dist, path)), `missing ${path}`);
});

test("About and Contact are their own pages with the approved email and profiles only", () => {
  const about = page("about/index.html");
  assert.match(about, /<h1[^>]*>About<\/h1>/);
  assert.ok(about.includes("The pieces are just more expensive now."));
  assert.ok(about.includes("University of Duisburg-Essen"));
  assert.ok(about.includes("spring 2027"));
  assert.ok(about.includes('href="/work/torchvk/"'));
  assert.ok(about.includes('href="/contact/"'));
  assert.match(about, /<p>Occasionally\.<\/p>/);
  assert.ok(!about.includes("Fun facts"));
  const contact = page("contact/index.html");
  assert.match(contact, /<h1[^>]*>Contact<\/h1>/);
  for (const url of [
    "https://de.linkedin.com/in/jeremy-darko-a0a850413",
    "https://github.com/jeremy341",
    "https://huggingface.co/Jeremy341",
  ]) {
    assert.ok(contact.includes(`href="${url}"`), `contact lacks ${url}`);
  }
  const emails = [...contact.matchAll(/mailto:([^"]+)"/g)].map((m) => m[1]);
  assert.deepEqual(emails, ["jeremyyeboahdarko@gmail.com"], "only the approved email may be public");
  assert.ok(contact.includes('href="/cv/"'), "contact links to the CV");
});

test("the CV page exists in English and German and keeps the phone number, home address and grades off the pages", () => {
  const en = page("cv/index.html");
  assert.match(en, /<html lang="en">/);
  assert.ok(/<h1[^>]*>CV<[/]h1>/.test(en), "the English CV has its title");
  assert.ok(en.includes("Work Experience") && en.includes("Siemens Energy"));
  const de = page("de/cv/index.html");
  assert.match(de, /<html lang="de">/);
  assert.ok(/<h1[^>]*>Lebenslauf<[/]h1>/.test(de), "the German CV has its title");
  assert.ok(de.includes("Siemens Energy"));
  for (const html of htmlFiles(dist).map((file) => readFileSync(file, "utf8"))) {
    assert.doesNotMatch(
      html,
      /7189960|Aktienstr|45473 M|45474 M|Zeugnis-Schnitt|12\.08\.2009|Thiene|DE40 ?3605|SPESDE/,
      "private details must not be published",
    );
  }
});

test("home links to all five sections", () => {
  const html = page("index.html");
  for (const href of ["/work/", "/blog/", "/certificates/", "/about/", "/contact/"]) {
    assert.match(html, new RegExp(`href="${href}"`), `nav lacks ${href}`);
  }
});

test("the German home links to the five German sections", () => {
  const html = page("de/index.html");
  for (const href of ["/de/work/", "/de/blog/", "/de/certificates/", "/de/about/", "/de/contact/"]) {
    assert.match(html, new RegExp(`href="${href}"`), `German nav lacks ${href}`);
  }
  assert.match(html, /<html lang="de">/);
});

test("Certificates lists each certificate with its issuer, and shows the internship letter only with its private line covered", () => {
  const en = page("certificates/index.html");
  assert.match(en, /<h1[^>]*>Certificates<\/h1>/);
  for (const title of ["Hack Club Stardance Challenge", "Internship at the University of Duisburg-Essen", "Nancy Grace Roman Space Telescope"]) {
    assert.ok(en.includes(title), `Certificates lacks "${title}"`);
  }
  assert.ok(en.includes("A9J6R5") && en.includes('href="https://stardance.space/certificate"'), "the Stardance code can be checked");
  assert.equal(en.match(/<img /g)?.length, 3, "three certificate images: Stardance, the redacted internship page and NASA");
  assert.match(en, /covered by a black bar/, "the internship image says what is covered");
  const opens = [...en.matchAll(/class="cert-open"><a href="#([\w-]+)"/g)].map((match) => match[1]);
  assert.equal(opens.length, 3, "each certificate picture is opened by its own link");
  for (const target of opens) assert.ok(en.includes(`id="${target}"`), `${target} is on the page`);
  const de = page("de/certificates/index.html");
  assert.match(de, /<h1[^>]*>Zertifikate<\/h1>/);
  assert.ok(de.includes("Praktikumszeugnis") && de.includes("Ausgestellt von"));
});

test("articles give their publication date and tags as article meta tags", () => {
  for (const slug of posts) {
    const file = `blog/${slug}/index.html`;
    const html = page(file);
    assert.match(html, /<meta property="article:published_time" content="\d{4}-\d{2}-\d{2}/, `${file} gives its publication date`);
    assert.match(html, /<meta property="article:tag" content="[^"]+"/, `${file} gives its tags`);
  }
});

test("projects with a public repository are marked as source code", () => {
  for (const slug of ["mira", "poorup", "torchvk", "fluidicstudio", "abivault", "mobilenet-on-fpga"]) {
    assert.match(page(`work/${slug}/index.html`), /"@type":"SoftwareSourceCode"/, `${slug} is marked as source code`);
  }
});

test("project pages say where to find the project and show their figures with descriptions", () => {
  const expected = {
    poorup: { hosts: ["github.com/jeremy341/Poorup", "poorup.tech"], images: 4 },
    mira: { hosts: ["github.com/jeremy341/MIRA-AI", "mira-vision.vercel.app", "huggingface.co/Jeremy341/MIRA-AI", "pypi.org/project/mira-ai/"], images: 3 },
    "mobilenet-on-fpga": { hosts: [], images: 2 },
    torchvk: { hosts: ["github.com/jeremy341/TorchVK"], images: 0 },
    fluidicstudio: { hosts: ["github.com/jeremy341/microdroplets-ui"], images: 0 },
    abivault: { hosts: ["github.com/jeremy341/abi-vault", "abi-vault-demo.vercel.app"], images: 2 },
  };
  for (const prefix of ["", "de/"]) {
    for (const [slug, want] of Object.entries(expected)) {
      const html = page(`${prefix}work/${slug}/index.html`);
      const bar = html.match(/<ul class="linkbar"[\s\S]*?<\/ul>/)?.[0] ?? "";
      for (const host of want.hosts) assert.ok(bar.includes(host), `${prefix}${slug}: the link row lacks ${host}`);
      const images = (html.match(/<img [^>]*>/g) ?? []).filter((img) => !/\salt(?:="")?(?:\s|>)/.test(img));
      assert.equal(images.length, want.images, `${prefix}${slug} should show ${want.images} pictures`);
      for (const img of images) {
        assert.match(img, /alt="[^"]{20,}"/, `${prefix}${slug}: a picture lacks a real description`);
        assert.match(img, /width="\d+"/);
        assert.match(img, /height="\d+"/);
      }
      assert.ok(html.includes("<figcaption>") === (want.images > 0), `${prefix}${slug}: captions and pictures disagree`);
    }
  }
});

test("each project with measurements has an In numbers section, and no page makes up what is missing", () => {
  for (const slug of Object.keys(projects)) {
    assert.ok(page(`work/${slug}/index.html`).includes('id="numbers"'), `${slug} lacks In numbers`);
    assert.ok(page(`de/work/${slug}/index.html`).includes("In Zahlen"), `German ${slug} lacks In Zahlen`);
  }
  // TorchVK has no code yet and MobileNet has no FPGA part; the pages must keep saying so.
  assert.match(page("work/torchvk/index.html"), /no working training backend, no implemented GPU compute shader and no measured benchmark result/);
  assert.match(page("work/mobilenet-on-fpga/index.html"), /no measured hardware resource or latency results/);
});

test("all translated pages link to their twin", () => {
  const files = htmlFiles(dist).filter((file) => !file.endsWith("404.html"));
  for (const file of files) {
    const html = readFileSync(file, "utf8");
    if (html.includes('http-equiv="refresh"')) continue; // redirects such as /start/ have no language switch
    const rel = file.slice(dist.length).split("\\").join("/").replace(/index\.html$/, "");
    const german = rel.startsWith("/de/");
    const twin = german ? rel.slice("/de".length) || "/" : `/de${rel}`;
    const group = html.match(/<div class="lang"[\s\S]*?<\/div>/)?.[0] ?? "";
    assert.ok(group.includes(`href="${twin}"`), `${rel} does not link to ${twin}`);
    assert.ok(existsSync(join(dist, twin, "index.html")), `${twin} does not exist`);
    assert.match(group, new RegExp(`<a [^>]*href="${rel}"[^>]*aria-current="page"`), `${rel} does not mark its own language`);
    assert.match(html, new RegExp(`<html lang="${german ? "de" : "en"}"`));
  }
});

test("the German pages carry German text and link only to German pages", () => {
  const projectsPage = page("de/work/index.html");
  assert.ok(projectsPage.includes("6 Projekte"));
  const about = page("de/about/index.html");
  assert.ok(about.includes("Universität Duisburg-Essen") && about.includes("Osterferien 2027"));
  assert.ok(about.includes('href="/de/work/torchvk/"'));
  assert.ok(about.includes('href="/de/contact/"'));
  assert.match(about, /<p>Gelegentlich\.<\/p>/);
  assert.equal(jsonLd(page("de/blog/index.html"))[0]["@graph"].find((node) => node["@type"] === "Blog").blogPost.length, posts.length);
  for (const file of htmlFiles(join(dist, "de"))) {
    // The switch itself points at the English twin, so it is left out.
    const html = readFileSync(file, "utf8").replace(/<div class="lang"[\s\S]*?<\/div>/g, "");
    const internal =[...html.matchAll(/ href="(\/[^"#?]*)"/g)].map((m) => m[1]);
    for (const href of internal) {
      if (/\.\w+$/.test(href)) continue; // files such as the favicon and the PDF are shared
      assert.ok(href.startsWith("/de/") || href === "/de", `${file} links to ${href}, which is not German`);
    }
  }
});

test("the home page name is one h1 that reads as the full name", () => {
  const html = page("index.html");
  const h1 = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/)[1];
  assert.match(h1, /<span class="sr-only">Jeremy Darko<\/span>/);
  assert.match(h1, /aria-hidden="true"/);
  assert.doesNotMatch(html, /<meta name="robots" content="noindex"/, "the home page is indexable");
  assert.match(page("start/index.html"), /http-equiv="refresh" content="0;url=\/"/, "/start/ redirects to the home page");
  assert.match(page("de/index.html"), /<h1[^>]*>/, "the German home page exists");
});

test("the title cursor is the only animation that runs forever, and reduced motion turns it off", () => {
  const styles = ["global.css", "pages.css"].map((name) => readFileSync(join(root, "src/styles", name), "utf8"));
  const forever = styles.join("\n").match(/^.*infinite.*$/gm) ?? [];
  assert.equal(forever.length, 1, "only one looping animation is allowed");
  assert.match(forever[0], /cursor-blink/);
  assert.match(styles[1], /@media \(prefers-reduced-motion: no-preference\) \{\s*\.page-title \.cur \{\s*animation: cursor-blink/);
});

test("the writing desk is not part of the build", () => {
  assert.equal(existsSync(join(dist, "write")), false);
  for (const file of htmlFiles(dist)) {
    assert.doesNotMatch(readFileSync(file, "utf8"), /href="\/write\/?"/, `${file} links to the desk`);
  }
});

test("Work lists all six projects and Writing lists every article", () => {
  const html = page("work/index.html");
  for (const [slug, project] of Object.entries(projects)) {
    assert.match(html, new RegExp(`href="/work/${slug}/"`), `no link to ${slug}`);
    assert.ok(html.includes(project.status), `${project.name} status missing`);
  }
  const blog = page("blog/index.html");
  for (const slug of posts) assert.match(blog, new RegExp(`href="/blog/${slug}/"`), `no link to ${slug}`);
});

test("only the theme icon ships, and pictures appear only on project pages and Certificates", () => {
  for (const file of htmlFiles(dist)) {
    const html = readFileSync(file, "utf8");
    const withoutThemeIcon = html.replace(/<svg class="theme-icon"[^>]*>[\s\S]*?<\/svg>/g, "");
    assert.doesNotMatch(withoutThemeIcon, /<svg|<canvas|<picture/, `${file} contains unexpected graphics`);
    const rel = file.slice(dist.length + 1).split("\\").join("/");
    if (/<img /.test(html)) {
      assert.match(rel, /^(de\/)?(work\/[\w-]+|certificates)\/index\.html$/, `${rel} should not carry pictures`);
    }
  }
});

test("old /#id project links still resolve", () => {
  const html = page("index.html");
  for (const [slug, project] of Object.entries(projects)) {
    assert.ok(html.includes(`"${project.legacy}":"${slug}"`), `legacy id ${project.legacy} not mapped`);
  }
});

test("each project page carries its record", () => {
  for (const [slug, project] of Object.entries(projects)) {
    const html = page(`work/${slug}/index.html`);
    assert.match(html, new RegExp(`<h1[^>]*>${project.name}</h1>`));
    assert.ok(html.includes(project.status));
    assert.match(html, /class="work-story"/, `${slug} should render its individual story`);
    assert.match(html, /id="story-1"/, `${slug} needs its own chapter outline`);
    assert.doesNotMatch(html, /id="figures"/, `${slug} should not move figures to a separate end gallery`);
    assert.match(html, /"@type":"(CreativeWork|SoftwareSourceCode)"/);
    const de = page(`de/work/${slug}/index.html`);
    assert.match(de, new RegExp(`<h1[^>]*>${project.name}</h1>`));
    assert.ok(de.includes(germanStatus[slug]), `German ${slug} lacks its status`);
    assert.match(de, /class="work-story"/, `${slug}: German edition should render its story`);
    assert.match(de, /id="story-1"/, `${slug}: German edition needs a chapter outline`);
    assert.doesNotMatch(de, /id="figures"/, `${slug}: figures belong inline in the German story`);
  }
});

test("content links point at routes, never at .md files", () => {
  for (const file of htmlFiles(dist)) {
    assert.doesNotMatch(readFileSync(file, "utf8"), /href="\/(?!\/)[^"]*\.md(?:[?#][^"]*)?"/, `${file} links to an internal .md file`);
  }
});

test("articles have dates and structured data", () => {
  for (const slug of posts) {
    const html = page(`blog/${slug}/index.html`);
    assert.match(html, /<time datetime="\d{4}-\d{2}-\d{2}">/, `${slug} has no date`);
    assert.match(html, /"@type":"BlogPosting"/);
    assert.match(html, /<article\b[^>]*>/);
  }
});

test("Markdown never renders raw HTML", () => {
  const html = renderMarkdown('<script>alert(1)</script>\n\n<b>bold</b> and [link](posts/x.md)');
  assert.doesNotMatch(html, /<script>|<b>/);
  assert.match(html, /&lt;script&gt;/);
  assert.match(html, /href="\/blog\/x\/"/);
});

test("crawler policy and no origin-dependent output without a domain", () => {
  const robots = page("robots.txt");
  assert.match(robots, /User-agent: OAI-SearchBot\nAllow: \//);
  assert.match(robots, /User-agent: GPTBot\nDisallow: \//);
});

/* Search and AI discovery */

const jsonLd = (html) => [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => JSON.parse(m[1]));
const pagesOf = () => new Map(htmlFiles(dist).map((file) => [file, readFileSync(file, "utf8")]));
const isRedirect = (html) => html.includes('http-equiv="refresh"');
const isInternal = (href) => href !== "" && !/^(https?:|mailto:|tel:|data:|#)/.test(href);

function resolveHref(href) {
  const path = href.split("#")[0];
  const target = path.endsWith("/") ? join(dist, path, "index.html") : join(dist, path);
  return existsSync(target) && statSync(target).isFile() ? target : undefined;
}

test("every page has its own title and a description of usable length", () => {
  const seen = { en: new Map(), de: new Map() };
  for (const [file, html] of pagesOf()) {
    if (file.endsWith("404.html") || isRedirect(html)) continue;
    const rel = file.slice(dist.length).split("\\").join("/");
    const lang = rel.startsWith("/de/") ? "de" : "en";
    const title = html.match(/<title>([^<]+)<\/title>/)[1];
    const description = html.match(/<meta name="description" content="([^"]*)"/)?.[1] ?? "";
    assert.ok(description.length >= 50 && description.length <= 220, `${rel}: description is ${description.length} characters`);
    assert.ok(!seen[lang].has(title), `${rel} repeats the title "${title}" of ${seen[lang].get(title)}`);
    seen[lang].set(title, rel);
  }
});

test("structured data parses on every page, and the person is described once, with the approved profiles only", () => {
  for (const [file, html] of pagesOf()) {
    for (const block of jsonLd(html)) {
      assert.equal(block["@context"], "https://schema.org", `${file} lacks the schema.org context`);
      assert.ok(Array.isArray(block["@graph"]) && block["@graph"].length > 0, `${file} has no graph`);
    }
  }
  const people = jsonLd(page("index.html"))[0]["@graph"].filter((node) => node["@type"] === "Person");
  assert.equal(people.length, 1);
  assert.deepEqual(
    people[0].sameAs,
    ["https://de.linkedin.com/in/jeremy-darko-a0a850413", "https://github.com/jeremy341", "https://huggingface.co/Jeremy341"],
    "sameAs lists the approved profiles and nothing else",
  );
  assert.equal(people[0].name, "Jeremy Darko");
  assert.equal(people[0].alternateName, "Jeremy Yeboah Darko");
  assert.equal(people[0].address.streetAddress, undefined, "no street address");
  assert.equal(people[0].telephone, undefined, "no phone number");
  assert.ok(people[0].knowsAbout.length >= 5, "the topics the person works on are listed");
  for (const href of ["https://github.com/jeremy341", "https://huggingface.co/Jeremy341"]) {
    assert.ok(page("index.html").includes(`<link rel="me" href="${href}">`), `home lacks rel=me for ${href}`);
  }
});

test("each German page declares German", () => {
  for (const [file, html] of pagesOf()) {
    const rel = file.slice(dist.length).split("\\").join("/");
    if (file.endsWith("404.html") || isRedirect(html) || !rel.startsWith("/de/")) continue;
    assert.match(html, /<html lang="de">/, `${rel} is not German`);
  }
});

test("each English page declares x-default for the language choice", () => {
  for (const [file, html] of pagesOf()) {
    const rel = file.slice(dist.length).split("\\").join("/");
    if (file.endsWith("404.html") || isRedirect(html) || rel.startsWith("/de/")) continue;
    assert.match(html, /hreflang="x-default"/, `${rel} lacks x-default`);
  }
});

test("every internal link and picture resolves to a file in the build", () => {
  for (const [file, html] of pagesOf()) {
    if (isRedirect(html)) continue;
    const rel = file.slice(dist.length).split("\\").join("/");
    const hrefs = [...html.matchAll(/<(?:a|link|img)\b[^>]*?\s(?:href|src)="([^"]*)"/g)].map((m) => m[1]).filter(isInternal);
    for (const href of hrefs) assert.ok(resolveHref(href), `${rel} links to ${href}, which is not in the build`);
  }
});

test("every page is reachable from the home page by links", () => {
  const pages = pagesOf();
  const start = join(dist, "index.html");
  const reached = new Set([start]);
  const queue = [start];
  while (queue.length) {
    const html = pages.get(queue.shift());
    for (const href of [...html.matchAll(/<a\b[^>]*?\shref="([^"]*)"/g)].map((m) => m[1]).filter(isInternal)) {
      const target = resolveHref(href);
      if (target?.endsWith(".html") && !reached.has(target)) {
        reached.add(target);
        queue.push(target);
      }
    }
  }
  for (const file of pages.keys()) {
    if (file.endsWith("404.html") || isRedirect(pages.get(file))) continue;
    assert.ok(reached.has(file), `${file.slice(dist.length)} cannot be reached from the home page`);
  }
});

test("llms.txt and llms-full.txt say who the person is, list every page, and keep private details out", () => {
  const index = page("llms.txt");
  assert.match(index, /^# Jeremy Darko$/m);
  for (const slug of Object.keys(projects)) assert.ok(index.includes(`/work/${slug}/`), `llms.txt lacks ${slug}`);
  for (const slug of posts) assert.ok(index.includes(`/blog/${slug}/`), `llms.txt lacks ${slug}`);
  for (const href of ["https://github.com/jeremy341", "https://huggingface.co/Jeremy341", "https://de.linkedin.com/in/jeremy-darko-a0a850413"]) {
    assert.ok(index.includes(href), `llms.txt lacks ${href}`);
  }
  assert.ok(index.includes("9.1K+ lifetime model downloads"), "llms.txt states the MIRA download count with its caveat");
  assert.doesNotMatch(index, /community and internships|an internship from 3 to 28 August/, "llms.txt does not describe removed About sections or call the UDE work an internship");
  const full = page("llms-full.txt");
  assert.match(full, /^## About Jeremy Darko$/m, "llms-full.txt carries the biography");
  assert.match(full, /^## CV$/m, "llms-full.txt carries the CV");
  assert.match(full, /^## Certificates$/m, "llms-full.txt carries the certificates");
  assert.equal(full.match(/^## Project: /gm)?.length, Object.keys(projects).length);
  assert.equal(full.match(/^## Article: /gm)?.length ?? 0, posts.length);
  for (const name of ["llms.txt", "llms-full.txt"]) {
    assert.doesNotMatch(page(name), /7189960|Aktienstr|45473 M|45474 M|Zeugnis-Schnitt|12\.08\.2009|Thiene|DE40 ?3605|SPESDE/, `${name} shows a private detail`);
  }
});

test("German pages are described in German by the same structured data", () => {
  const home = jsonLd(page("de/index.html"))[0]["@graph"];
  const person = home.find((node) => node["@type"] === "Person");
  assert.match(person.description, /^Jeremy Darko ist ein Schüler/);
  assert.match(page("de/index.html"), /<title>Jeremy Darko \| Computer Engineering, Machine Learning, GPU-Computing und Hardware<\/title>/);
  assert.match(page("de/blog/index.html"), /"@type":"Blog"/);
});

test("the feeds, sitemap, canonical links and share images use absolute addresses", () => {
  const origin = (process.env.PUBLIC_SITE_URL ?? "https://jeremydarko.me").replace(/\/$/, "");
  for (const [feed, lang, count] of [["rss.xml", "en", posts.length], ["de/rss.xml", "de", posts.length]]) {
    const xml = page(feed);
    assert.equal(xml.match(/<item>/g)?.length ?? 0, count, `${feed} lists articles in that language`);
    for (const [, link] of xml.matchAll(/<link>([^<]+)<\/link>/g)) assert.ok(link.startsWith(origin), `${lang} feed link ${link} is not absolute`);
  }
  const sitemap = page("sitemap.xml");
  assert.ok(sitemap.includes(`<loc>${origin}/</loc>`));
  assert.ok(sitemap.includes(`hreflang="de" href="${origin}/de/work/mira/"`), "the sitemap names the German twin");
  assert.ok(!sitemap.includes("/start/"), "redirect pages stay out of the sitemap");
  assert.ok(page("index.html").includes(`<link rel="canonical" href="${origin}/">`));
  assert.ok(page("index.html").includes(`<meta property="og:image" content="${origin}/og-card.png">`));
  assert.ok(page("de/index.html").includes(`<meta property="og:image" content="${origin}/og-card-de.png">`));
  assert.ok(page("robots.txt").includes(`Sitemap: ${origin}/sitemap.xml`));
  assert.ok(page("work/mira/index.html").includes(`"item":"${origin}/work/mira/"`), "breadcrumbs use absolute addresses");
});

test("every page has a skip link and one h1", () => {
  for (const file of htmlFiles(dist)) {
    const html = readFileSync(file, "utf8");
    if (html.includes('http-equiv="refresh"')) continue; // the /start/ redirects have no page to check
    assert.match(html, /class="skip-link" href="#main"/, `${file} lacks the skip link`);
    assert.equal(html.match(/<h1[\s>]/g)?.length, 1, `${file} should have exactly one h1`);
  }
});

test("site code uses no em or en dashes", () => {
  const walk = (dir) =>
    readdirSync(dir).flatMap((name) => {
      const full = join(dir, name);
      return statSync(full).isDirectory() ? walk(full) : [full];
    });
  for (const file of walk(join(root, "src")).filter((f) => /\.(astro|ts|css)$/.test(f))) {
    assert.doesNotMatch(readFileSync(file, "utf8"), /[–—]/, `${file} contains a dash character`);
  }
});

/* Colour contrast, read straight from the theme tokens. */

function tokens(source) {
  return Object.fromEntries([...source.matchAll(/--([\w-]+):\s*(#[0-9a-f]{6})/gi)].map(([, k, v]) => [k, v]));
}

function luminance(hex) {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a, b) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

function themeBlock(css, selector) {
  const start = css.indexOf(`${selector} {`);
  return css.slice(start, css.indexOf("}", start));
}

test("the palette meets WCAG AA contrast in dark and light mode", () => {
  const css = readFileSync(join(root, "src/styles/global.css"), "utf8");
  for (const selector of [":root", ':root[data-theme="light"]']) {
    const t = tokens(themeBlock(css, selector));
    for (const [fg, min] of [["fg", 7], ["muted", 4.5], ["accent", 4.5], ["error", 4.5], ["search", 4.5], ["status", 4.5]]) {
      assert.ok(contrast(t[fg], t.bg) >= min, `${selector} ${fg} on bg is ${contrast(t[fg], t.bg).toFixed(2)}, needs ${min}`);
    }
  }
});

test("light mode is chosen before the first paint and offered in the status line", () => {
  const html = page("index.html");
  assert.ok(html.includes('localStorage.getItem("jd:theme")'));
  assert.equal(html.split("data-theme-switch").length - 1, 3, "desktop, mobile and status-line switches are present");
  assert.ok(html.includes('name="color-scheme" content="light dark"'));
});


test("mobile header offers an accessible search and menu on both languages", () => {
  for (const locale of ["", "de/"]) {
    const html = page(locale + "blog/index.html");
    const labels = locale ? ["Projekte", "Blog", "Zertifikate", "Über mich", "Kontakt"] : ["Work", "Blog", "Certificates", "About", "Contact"];
    assert.match(html, /<details class="mobile-nav">/);
    assert.match(html, /<summary class="mobile-toggle" aria-label="(?:Menu|Menü)">/);
    assert.match(html, /class="mobile-find" data-find aria-label=/);
    assert.match(html, /<nav class="mobile-panel" aria-label=/);
    assert.match(html, /class="mobile-settings"/);
    for (const label of labels) assert.ok(html.includes(label), "missing mobile navigation: " + label);
  }
});


test("mobile homepage keeps the navigation below a full first-screen hero", () => {
  const css = readFileSync(join(root, "src/styles/global.css"), "utf8");
  assert.match(css, /\/\* The landing hero occupies the complete first viewport[\s\S]*?\.dash-hero\s*\{\s*min-height:\s*calc\(100svh - 64px\)/);
  assert.doesNotMatch(css, /min-height:\s*clamp\(270px,\s*44svh,\s*480px\)/);
});



test("work stories place all existing figures inline, not in an end gallery", () => {
  const counts = { mira: 3, poorup: 4, "mobilenet-on-fpga": 2, abivault: 2, torchvk: 0, fluidicstudio: 0 };
  for (const [slug, count] of Object.entries(counts)) {
    const html = page("work/" + slug + "/index.html");
    const storyStart = html.indexOf('class="work-story"');
    const storyEnd = html.indexOf('id="numbers"');
    assert.ok(storyStart >= 0 && storyEnd > storyStart, slug + ": story should precede technical reference");
    const inside = html.slice(storyStart, storyEnd);
    const figures = inside.match(/<figure class="fig">/g) ?? [];
    assert.equal(figures.length, count, slug + ": figures should appear in the story at their selected locations");
    assert.doesNotMatch(html, /id="figures"/, slug + ": generic figure gallery remains");
  }

  const mira = page("work/mira/index.html");
  const data = mira.indexOf('id="story-2-title"');
  const validation = mira.indexOf('id="story-3-title"');
  const exportChapter = mira.indexOf('id="story-5-title"');
  const closing = mira.indexOf('id="story-6-title"');
  assert.ok(data > -1 && validation > data && exportChapter > validation && closing > exportChapter);
  assert.match(mira.slice(data, validation), /<figure class="fig">/, "the dataset discussion includes the class-metric figure");
  assert.match(mira.slice(exportChapter, closing), /<figure class="fig">/, "export discussion includes a model-size figure");
});

test("blog content remains unchanged by project case-study work", () => {
  const first = readFileSync(join(root, "content/posts/first-blog.md"), "utf8");
  const second = readFileSync(join(root, "content/posts/am-i-famous-now.md"), "utf8");
  assert.match(first, /To all future employers: please hire me on the spot/);
  assert.match(second, /Hi, if you are reading this, it seems like my clickbait worked/);
});


test("fenced Markdown becomes a real IDE-like Shiki buffer in both themes", () => {
  const source = [
    "~~~js title=clientAuctionUi.js",
    "function serverNow() {",
    "  return Date.now() + (state.serverTimeOffset || 0);",
    "}",
    "~~~",
  ].join("\n");
  const html = renderMarkdown(source);
  assert.match(html, /class="code-panel"/);
  assert.match(html, /class="code-panel-title"/);
  assert.match(html, /class="code-file">clientAuctionUi\.js<\/span>/);
  assert.match(html, /JavaScript \/ 3 lines/);
  assert.match(html, /<pre class="shiki/);
  assert.match(html, /<code class="language-js">/);
  assert.match(html, /class="line"/);
  assert.match(html, /--shiki-dark:/);
  assert.match(html, /--shiki-light:/);
  assert.doesNotMatch(html, /~~~js/);

  const python = renderMarkdown("~~~python\nprint('hi')\n~~~");
  assert.match(python, /<pre class="shiki/);
  assert.match(python, /class="language-python"/);
  const sql = renderMarkdown("~~~sql\nSELECT amount FROM ledger;\n~~~");
  assert.match(sql, /class="language-sql"/);

  // A source sample or title must not be able to inject executable HTML.
  const unsafe = renderMarkdown("~~~js title=<script>\nconst x = '<script>alert(1)</script>';\n~~~");
  assert.doesNotMatch(unsafe, /<script>/);
  assert.match(unsafe, /&#x3C;script>alert\(1\)&#x3C;\/script>/);
  assert.doesNotMatch(unsafe, /class="code-file"><script>/);
});

test("flow Markdown becomes a flat accessible process diagram rather than ASCII art", () => {
  const html = renderMarkdown(["~~~flow", "Input images", "Detector", "CSV export", "~~~"].join("\n"));
  assert.match(html, /class="project-flow" role="group" aria-label="Process flow diagram"/);
  assert.match(html, /PIPELINE \/ 3 STEPS/);
  assert.match(html, /<ol><li><span>Input images<\/span><\/li><li><span>Detector<\/span><\/li><li><span>CSV export<\/span><\/li><\/ol>/);
  assert.doesNotMatch(html, /~~~flow/);
  const xss = renderMarkdown(["~~~flow", "<script>", "Other step", "~~~"].join("\n"));
  assert.doesNotMatch(xss, /<script>/);
});

test("project pages render source blocks and diagrams and retain technical claims", () => {
  const poorup = page("work/poorup/index.html");
  assert.match(poorup, /class="code-panel"/);
  assert.match(poorup, /class="code-file">clientAuctionUi\.js<\/span>/);
  assert.match(poorup, /class="language-js"/);
  assert.match(poorup, /--shiki-dark:/);

  const torch = page("work/torchvk/index.html");
  assert.match(torch, /class="project-flow"/);
  assert.match(torch, /<code>torch\.cuda<\/code>/);
  assert.match(torch, /no working training backend/);

  const fluid = page("work/fluidicstudio/index.html");
  assert.match(fluid, /class="project-flow"/);
  assert.match(fluid, /class="code-file">shutdown-trace\.txt<\/span>/);
  assert.match(fluid, /class="shiki shiki-plain"/);
  assert.match(fluid, /<code>P1ON<\/code>/);

  assert.match(page("work/mira/index.html"), /<code>mira-ai<\/code>/);
  assert.match(page("work/abivault/index.html"), /<code>bigint<\/code>/);
  const mobileNet = page("work/mobilenet-on-fpga/index.html");
  assert.match(mobileNet, /77\.94%/);

  for (const slug of ["poorup", "torchvk", "fluidicstudio", "mira", "abivault"]) {
    const html = page("work/" + slug + "/index.html");
    assert.doesNotMatch(html, /\\\x60|&#96;&#96;&#96;|&#x60;&#x60;&#x60;/, slug + ": escaped Markdown leaked onto the page");
  }
});

test("IDE chrome and flat diagrams follow the portfolio's own styles", () => {
  const css = readFileSync(join(root, "src/styles/pages.css"), "utf8");
  assert.match(css, /\.code-panel\s*\{[^}]*border-radius:\s*0;/s);
  assert.doesNotMatch(css, /\.code-panel-dot/);
  assert.match(css, /code-panel pre\.shiki \.line::before/);
  assert.match(css, /\[data-theme="light"\] \.code-panel \.shiki/);
  assert.match(css, /\.project-flow li\s*\{[^}]*border-left:\s*1px solid var\(--line\);/s);
});


test("published blog articles have matching German editions and reciprocal hreflang", () => {
  const origin = (process.env.PUBLIC_SITE_URL ?? "https://jeremydarko.me").replace(/\/$/, "");
  const en = readdirSync(join(root, "content/posts")).filter((name) => name.endsWith(".md") && name !== "README.md").sort();
  const de = readdirSync(join(root, "content/de/posts")).filter((name) => name.endsWith(".md") && name !== "README.md").sort();
  assert.deepEqual(de, en);
  for (const file of en) {
    const english = readFileSync(join(root, "content/posts", file), "utf8");
    const german = readFileSync(join(root, "content/de/posts", file), "utf8");
    for (const field of ["slug", "publishedAt", "tags"]) {
      const pattern = new RegExp("^" + field + ": (.+)$", "m");
      assert.equal(german.match(pattern)?.[1], english.match(pattern)?.[1], file + ": " + field);
    }
    const slug = english.match(/^slug: (.+)$/m)[1];
    for (const path of ["blog/" + slug + "/index.html", "de/blog/" + slug + "/index.html"]) {
      const html = page(path);
      assert.ok(html.includes('hreflang="de" href="' + origin + '/de/blog/' + slug + '/"'));
      assert.ok(html.includes('hreflang="en" href="' + origin + '/blog/' + slug + '/"'));
    }
  }
});


test("German project stories preserve the English chapter and figure structure and reference links", () => {
  for (const slug of Object.keys(projects)) {
    const en = readFileSync(join(root, "content/projects", slug + ".md"), "utf8");
    const de = readFileSync(join(root, "content/de/projects", slug + ".md"), "utf8");
    const story = (text) => text.split(/^## Story\s*$/m)[1].split(/^## /m)[0];
    assert.equal((story(de).match(/^### /gm) || []).length, (story(en).match(/^### /gm) || []).length, slug + ": chapter count");
    const figures = (text) => [...story(text).matchAll(/\{\{figure:(\d+)\}\}/g)].map(m => m[1]);
    assert.deepEqual(figures(de), figures(en), slug + ": inline figure order");
    const refs = (text) => [...text.split(/^## Links\s*$/m)[1].matchAll(/^- \[[^\]]+\]\(([^)]+)\)/gm)].map(m => m[1]);
    assert.deepEqual(refs(de), refs(en), slug + ": reference link parity");
  }
});
