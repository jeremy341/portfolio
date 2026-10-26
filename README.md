# portfolio

My personal site: projects, articles, certificates, a CV, about and contact. It's built with [Astro](https://astro.build), and the text lives in Markdown files, so most changes happen in `content/`.

Live at https://jeremydarko.me.

## Getting started

You need Node.js. Then:

```bash
npm install
npm run dev
```

While you're developing, the site runs at http://localhost:5173. The dev server also serves a local writing page at `/write/`, which is not included in the build.

## Commands

- `npm run dev`: starts the dev server
- `npm run build`: builds the site into `dist/`
- `npm test`: builds the site, then checks pages, links, crawler rules, contrast and the Markdown
- `npm run check`: runs the type and template checks

## Where things are

- `content/`: everything you read on the site, in English, plus German versions in `content/de/`
- `content/projects/`: one file per project
- `content/posts/`: articles, with `title`, `description`, `slug` and `publishedAt` at the top. Set `draft: true` to hide one.
- `src/`: pages, layouts, styles and the scripts behind them
- `public/`: files that are copied as they are, like the hover-preview images

## Domain and feeds

The site is set to jeremydarko.me in `astro.config.mjs`. Set `PUBLIC_SITE_URL` to build for another address. The build also writes the sitemap, the RSS feeds and `llms.txt` / `llms-full.txt`.

If you want search console verification, set `PUBLIC_GOOGLE_SITE_VERIFICATION` or `PUBLIC_BING_SITE_VERIFICATION` to the token the console gives you.

## Notes on what goes on the site

- Unfinished work is marked as unfinished, and measured results keep their limits next to them.
- The only public email is the one on the contact page.
- The CV leaves out my phone number, home address and grades.
