# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Primary: fellow builders.** Hack Club members and people arriving from GitHub or Hugging Face who want to explore what Jeremy made and how it works, and go deeper into source, models and write-ups.
- **Secondary: internship hosts.** People deciding on a holiday internship around computer vision, ML systems, GPU computing or hardware. They skim and look for honest proof.

## Product Purpose

The personal site of Jeremy Darko, a student builder in North Rhine-Westphalia, Germany. It shows six projects across software and hardware, articles that are being written again, a Certificates page, a short About and a Contact list (email, CV and the three approved public profiles), a German CV page, and nothing else: no icons or pixel art. Project pages carry real screenshots and result charts. Success: a builder finds a project worth opening and follows it to source, a demo or an article.

## Positioning

His own line: "Curiosity takes me from software down to the hardware underneath." The projects really do span the stack, from a multiplayer browser game and a terminal coding companion, through ML models with public downloads, to Vulkan GPU compute and FPGA-oriented MobileNet work. He describes unfinished work honestly instead of overselling it.

## Operating Context

- Visitors usually arrive from a profile link (GitHub, Hugging Face, LinkedIn) or Hack Club.
- They read on a desktop or a phone.
- Everything published comes from Markdown files in `content/`; a local writing desk at `/write/` drafts articles in dev only.

## Capabilities and Constraints

- Static Astro site; no backend.
- Separate URLs for each project (`/work/<slug>/`), the blog and each article.
- Old `/#<id>` project links and `?filter=<category>` links must keep working.
- Project categories: Games & software, Machine learning, Systems & compute, Hardware & embedded.
- Domain: jeremydarko.me (default in astro.config.mjs; `PUBLIC_SITE_URL` overrides it). Canonical URLs, absolute share-image addresses, the sitemap and the RSS feeds are built from it. `llms.txt` and `llms-full.txt` are always built.
- Crawler policy: allow OAI-SearchBot, disallow GPTBot.

## Brand Commitments

These were set by Jeremy during this rebuild:
- Plain, clean typography. Projects, posts and certificates are the content; no icons, sprites, illustrations or decorative elements. Pictures are allowed only when they are real (a screenshot of the actual software, a chart of the project's own numbers, a certificate) and carry a caption that says what they do and do not show.
- Follows the visitor's light or dark system theme on the first visit. A light/dark switch sits in the top bar and the status line, and the choice is saved in the browser.
- No "JD" logo. No modals.

## Evidence on Hand

- Six project records with status and limitations in `content/projects/`.
- MIRA: 6,500+ lifetime model downloads on Hugging Face. This is a download counter, not unique users, and the caveat must stay next to the number.
- No articles are published right now; they were removed to be written again. New ones go in `content/posts/`.
- **Absent, must not be invented:** testimonials, benchmarks, project screenshots. Every number and picture comes from the project's own repository, log or live demo. The CV and email come from Jeremy's own CV and instruction; phone, home address, date of birth and grades stay unpublished, so the internship letter appears on Certificates only as its reference page (page 2), with the birth line covered by a bar burned into the pixels; the cover letter (address, IBAN) is never shown.

## Product Principles

- Show the real work and its real state; keep limitations next to claims.
- Let builders go deeper in one click: source, demo, models, article.
- UDE means project work with people at the EBS chair, never a university role.
- Personality comes from honest writing and well-set type, not from decoration or claims.
