# Design

## Idea
A plain typographic index set like an editor buffer (Neovim, Tokyo Night). Home is the name, one paragraph and a numbered 01 to 05 index of Work, Writing, Certificates, About and Contact. Nothing is drawn: no icons, illustrations, cards or shadows. The only pictures are real ones, on project pages and on Certificates: screenshots of the software, charts redrawn from the projects' own logs in the site's colours (`tools/charts.py`), and the certificates themselves. Each sits in a one-pixel frame with a numbered caption (`fig 01`) and opens full size on click.

## Tokens
- Ground / ink: `#1a1b26` / `#c0caf5`. Dark only, no toggle. Panel `#16161e`, row hover `#292e42`.
- Muted text `#8a93bd`. Hairline `#2f334d`, dashed. Accent `#7aa2f7` for hover, focus, selection and the cursor block.
- Type: Geist Mono (variable) everywhere, 15px / 1.7. Name and page titles `clamp(2rem, 1rem + 3.4vw, 3.4rem)` / 700 with a `# ` mark and a steady block cursor on the last letter (nothing blinks). The home name is a full-screen two-line `# Jeremy` / `Darko` set in 0.6em cells. Section titles `## `. Entry titles 1.1rem / 600, numbered `01  `.
- Shape: no radii, no shadows. A bottom status line (mode, file path, scroll %).

## Layout
12-column grid above 760px, 24px gutter, content max 1200px. Section titles sit in columns 1-3; content starts at column 4. Below 760px everything stacks and titles sit above their content.

## Components
- Entry: name left, status or date right, summary muted below, tech or reading time last. Hover or focus tints the row and turns the name accent.
- Facts: three label/value pairs on project pages.
- Prose: 62ch measure, 1.75 line height, underlined links.

## Motion
One entrance on load: the title and rows rise 10px and fade in, staggered 45ms. Removed under `prefers-reduced-motion`.