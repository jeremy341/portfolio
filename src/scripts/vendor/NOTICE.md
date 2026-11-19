# ASCII Koi (vendored)

`ascii-koi.js` is the pond engine from <https://github.com/pursurer/ascii-koi> (MIT License, see `LICENSE`), taken from the copy in <https://github.com/jeremy341/nishiki-ai>.

Changes made here for the portfolio 404 page:

- The monospace stack uses the site's bundled "Geist Mono Variable" face.
- Only the pond engine is vendored; the original stylesheet is replaced with the site's own tokens in `src/styles/pages.css`.
- The 404 page sets its own pond colours from the site palette and feeds the koi on pointer interaction.
- An `export {}` marker was added at the end so the file can be loaded with a dynamic import.

The drawing and simulation code is otherwise the original engine.
