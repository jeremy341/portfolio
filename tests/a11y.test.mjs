import assert from "node:assert/strict";
import { test } from "node:test";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { JSDOM } from "jsdom";
import axe from "axe-core";

const dist = join(process.cwd(), "dist");

function htmlFiles(dir) {
  const found = [];
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) found.push(...htmlFiles(path));
    else if (name.endsWith(".html")) found.push(path);
  }
  return found;
}

test("built pages have no axe-core WCAG A/AA violations", async () => {
  let audited = 0;
  for (const file of htmlFiles(dist)) {
    const html = readFileSync(file, "utf8");
    if (html.includes('http-equiv="refresh"')) continue; // redirect stubs have no content to audit

    const dom = new JSDOM(html, { runScripts: "outside-only", url: "https://jeremydarko.me/" });
    dom.window.eval(axe.source);
    const results = await dom.window.axe.run(dom.window.document, {
      runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"] },
      rules: {
        // jsdom has no layout engine: contrast needs canvas and the brand's responsive text
        // needs CSS. Both are covered by real checks in site.test.mjs instead.
        "color-contrast": { enabled: false },
        "label-content-name-mismatch": { enabled: false },
      },
    });

    const label = file.slice(dist.length).split("\\").join("/");
    assert.equal(
      results.violations.length,
      0,
      `${label}: ${results.violations.map((v) => `${v.id} (${v.nodes.length}) — ${v.help}`).join("; ")}`,
    );
    audited++;
  }
  assert.ok(audited >= 30, `only ${audited} pages were audited`);
});
