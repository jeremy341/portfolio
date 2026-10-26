# Non-visual feature notes

This document retains useful behavior and content requirements. The current site (rebuilt on 2026-10-14) implements the capabilities listed below; the future ideas further down are still not built.

## Capabilities from the previous portfolio

- Separate public Work, About, Contact, and Blog URLs, plus individual article URLs.
- Six project records with categories, status, technologies, context, approach, limitations, and source or demo links.
- Project filtering by category and direct links to a selected project.
- About content covering biography, UDE project work, community, internships, and technical interests.
- Approved public profile links, with a copy-GitHub-link action and feedback when copying was unavailable.
- Markdown articles with titles, summaries, slugs, publication dates, optional update dates, and tags.
- Markdown support for headings, paragraphs, lists, blockquotes, links, and fenced code blocks. Raw HTML was not rendered.
- A local writing desk for title, summary, slug, tags, Markdown editing, preview, browser-local autosave, and Markdown export.
- Draft content stayed local; the writer did not upload or publish anything. Browser-local drafts have not been exported during this cleanup.
- Publication and editing are separate concerns. Any future authenticated online publisher needs an actual authentication and server-side authorization boundary.
- Keyboard-operable controls and accessible feedback for filtering, navigation, and copying.
- Search-discoverability requirements: useful first-person content, section-specific descriptions, consistent identity/profile references, article metadata, public canonical URLs, and a sitemap only after a real production origin is chosen.
- Previously selected crawler policy: allow OAI-SearchBot for search; disallow GPTBot for training. Do not promise ranking or AI Overview inclusion.

## Previously saved future ideas, not implemented

### Scratchpad

- Sketch a project icon, system diagram, or experiment note.
- Draw, erase, sample, clear, undo, and export.
- Optionally save an artifact beside a project record.
- Give keyboard shortcuts mouse and touch equivalents.

### Reading notes and research notebook

- Group notes by project, question, source, and next step.
- Separate what I saw, what I think, what remains unknown, and the source link.
- Support entries, a table of contents, and direct references from a project record.
- Describe reading progress honestly rather than inventing percentages.
- Preserve early-research, prototype, prerelease, and limitation labels where appropriate.

### Project evidence

- Group work by current status without implying a false completion ladder.
- Keep architecture, evidence, limitations, and next questions distinct.
- Associate annotated artifacts, conceptual diagrams, notes, and experiments with the real project information.
