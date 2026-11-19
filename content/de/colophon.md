## Schrift und Farben

Die Website liefert die variable Schrift Geist Mono selbst aus. Festbreitenschrift und feine gestrichelte Linien erinnern an einen Texteditor.

In der dunklen Tokyo-Night-Palette steht `--bg` (#1a1b26) für den Hintergrund, `--fg` (#c0caf5) für Text, `--line` (#2f334d) für Trennlinien und `--accent` (#7aa2f7) für Tastaturfokus und Hover. Im hellen Modus haben dieselben Tokens andere Farbwerte.

## Build und Hosting

Astro erzeugt statisches HTML. Markdown-it rendert den Text und Shiki hebt Quellcode farblich hervor. GitHub Actions veröffentlicht den Build auf GitHub Pages. Die Website verwendet keine Webanalyse oder Tracking-Skripte.

## Inhalte

Die englischen Markdown-Dateien bearbeite ich in `content/`, die deutschen in `content/de/`. Beim nächsten Deployment gehen die Änderungen online.
