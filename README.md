# Jeremy Darko, portfolio

A static portfolio built with [Astro](https://astro.build). Every word on the site comes from the Markdown files in `content/`; the code only lays them out.

## Commands

| Command | What it does |
| --- | --- |
| `npm run dev` | Dev server at http://localhost:5173, including the writing desk at `/write/` |
| `npm run build` | Static site in `dist/` |
| `npm test` | Builds, then checks pages, links, crawler rules, contrast and Markdown safety |
| `npm run check` | Type and template checks |

The domain is jeremydarko.me, set in `astro.config.mjs`; `PUBLIC_SITE_URL` overrides it. The build adds canonical and hreflang URLs, absolute share-image addresses, `sitemap.xml` (with each page's German and English twin) and the RSS feeds at `/rss.xml` and `/de/rss.xml`.

`llms.txt` and `llms-full.txt` are always built, so language models can read a plain-text summary and the full text of every project and article. Their links are relative until a domain is set.

Optional search-console verification: set `PUBLIC_GOOGLE_SITE_VERIFICATION` and/or `PUBLIC_BING_SITE_VERIFICATION` to the token each console gives you, and the build adds that meta tag.

## Design

Projects and posts only, set as plain type:

- **Type:** Geist Mono everywhere, self-hosted through Fontsource, so the site reads like a buffer in an editor.
- **Colour:** Tokyo Night (dark only, no toggle) with one blue accent used for hover, focus, selection and the cursor block.
- **Layout:** a 12-column grid. Section titles sit in columns 1-3 and all content starts at column 4. Home opens with the name on one screen, then four numbered section rows (`src/pages/[...lang]/index.astro`, `src/scripts/hero.ts`). Headings carry markdown marks (`#`, `##`) and a steady block cursor on the last letter.
- **Editor chrome:** the status line, modes and keys live in `src/scripts/editor.ts` (markup in `Base.astro`). Keys: `j k d u gg G H`, `w b a c` on the home pages, `:` for the command line (`:e {file}` with Tab, `:help`, `:intro`, `:set nokeys`, `:q`). A visible "keys on/off" switch in the status line turns every shortcut off. Selecting text switches the mode chip to VISUAL.
- **Home intro:** the cursor overwrites the name once per tab session (reload or `/?intro` plays it again; it is skipped for reduced motion, back/forward and hash links). The cursor smear runs from J to o, and `j`/`k` move between the section rows (`src/scripts/hero.ts`, `smear.ts`). `/start/` redirects to the home page.
- **Page changes:** cross-document view transitions keep the header and status line still while the text swaps (90 ms crossfade); links are prefetched on hover.
- **No icons, sprites or decoration.** Pictures appear only on project pages and Certificates: files in `src/assets/work/<project>/` and `src/assets/certificates/`, named in the Markdown (`## Figures`, `- Image:`) and optimised by Astro at build time. The result charts are drawn by `python tools/charts.py` from numbers copied out of each project's log, in English and German. `src/styles/global.css` holds every token and rule.
- The decision record is in `.impeccable/surfaces/` and the product facts are in `PRODUCT.md`.

## Content

- [Projects](content/projects/README.md): six project records, shown in that file's order with MIRA first.
- [Articles](content/posts/README.md): Markdown with frontmatter. Files with `draft: true` are skipped.
- [Feature notes](content/feature-notes.md): behaviour the site keeps, and ideas not built yet.

Pages: `/` (name only), `/work/`, `/work/<project>/`, `/blog/`, `/blog/<article>/`, `/certificates/`, `/about/`, `/contact/`, `/cv/`. Certificates are read from `content/certificates.md`; a project can add `## In numbers` (`- Label: value`) and `## Figures` (`- ![description](project/file.png) Caption`) sections. Old links such as `/#mira` forward to the project page. About and Contact are read from `content/about.md` and `content/contact.md`.

## Writing

The writing desk at `/write/` exists only under `npm run dev`. It previews Markdown, autosaves in the browser and exports a `.md` file. To publish, move the export into `content/posts/` and remove `draft: true`. Nothing is uploaded.

## Content boundaries

- Describe unfinished work and measured results honestly. Keep evaluation caveats next to claims.
- UDE means project work with people connected to the EBS chair, not a claimed university employment or researcher role.
- The MIRA milestone is 6,500+ lifetime model downloads, not 6,500 distinct users.
- The only public email is jeremyyeboahdarko@gmail.com. The CV page (/cv/) omits phone number, home address and grades on purpose.
- The domain is jeremydarko.me (set in astro.config.mjs; PUBLIC_SITE_URL overrides it). Deployment and public hosting are still to do.
