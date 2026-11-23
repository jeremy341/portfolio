# Design

## Idea
A plain typographic index set like an editor buffer (Neovim, Tokyo Night). Home opens with the name, a concise focus and internship note, and links to two case studies and the CV. The numbered 01 to 05 index of Work, Blog, Certificates, About and Contact follows. The home introduction uses no icons, illustrations, cards or shadows. Project screenshots, charts redrawn from the projects' own logs (`tools/charts.py`), and certificate images sit in one-pixel frames and can be opened full size. The site and its three articles are available in English and German.

## Tokens
- Ground / ink: dark `#1a1b26` / `#c0caf5`; light `#e6e7ed` / `#1a1b26`. The site follows the system preference until the reader changes it with a theme switch.
- Muted text: dark `#8a93bd`, light `#4c5577`. Hairlines: dark `#2f334d`, light `#b4b9cf`. Accent: dark `#7aa2f7`, light `#2552b8`, used for links, focus and the cursor block.
- Type: Geist Mono (variable). The home name sits on one line in 0.6em cells with an editor cursor, sized to the available width. Page headings carry a `# ` mark, and entries are numbered `01  `.
- Shape: no radii, no shadows. A bottom status line (mode, file path, scroll %).

## Layout
12-column grid above 760px, 24px gutter, content max 1200px. Section titles sit in columns 1-3; content starts at column 4. Below 760px everything stacks and titles sit above their content.

## Components
- Entry: name left, status or date right, summary muted below, tech or reading time last. Hover or focus tints the row and turns the name accent.
- Facts: three label/value pairs on project pages.
- Prose: 62ch measure, 1.75 line height, underlined links.

## Motion
One entrance on load: the title and rows rise 10px and fade in, staggered 45ms. Removed under `prefers-reduced-motion`.
