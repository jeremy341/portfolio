import { dump, load } from "js-yaml";
import { renderMarkdown } from "../lib/markdown";

// Same key as the previous writer, so earlier drafts in this browser load.
const KEY = "portfolio.blogDraft.v1";

interface Meta {
  title: string;
  description: string;
  slug: string;
  tags: string[];
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function toMarkdown(meta: Meta, body: string, date = new Date()): string {
  const frontmatter = dump(
    {
      title: meta.title,
      description: meta.description,
      slug: meta.slug || slugify(meta.title),
      publishedAt: date.toISOString().slice(0, 10),
      tags: meta.tags,
      draft: true,
    },
    { noRefs: true, lineWidth: -1 },
  );
  return `---\n${frontmatter}---\n\n${body.trimEnd()}\n`;
}

export function fromMarkdown(source: string): { meta: Partial<Meta>; body: string } {
  const match = source.match(/^---\n([\s\S]*?)\n---\n\n?([\s\S]*)$/);
  if (!match) return { meta: {}, body: source };
  try {
    const data = (load(match[1]) ?? {}) as Record<string, unknown>;
    return {
      meta: {
        title: String(data.title ?? ""),
        description: String(data.description ?? ""),
        slug: String(data.slug ?? ""),
        tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
      },
      body: match[2],
    };
  } catch {
    return { meta: {}, body: source };
  }
}

export function initDesk() {
  const form = document.querySelector<HTMLFormElement>("[data-desk]");
  const preview = document.querySelector<HTMLElement>("[data-preview]");
  const status = document.querySelector<HTMLElement>("[data-desk-status]");
  if (!form || !preview || !status) return;
  const field = (name: string) => form.elements.namedItem(name) as HTMLInputElement | HTMLTextAreaElement;

  const read = (): { meta: Meta; body: string } => ({
    meta: {
      title: field("title").value.trim(),
      description: field("description").value.trim(),
      slug: field("slug").value.trim(),
      tags: field("tags").value.split(",").map((t) => t.trim()).filter(Boolean),
    },
    body: field("body").value,
  });

  const render = () => {
    const { body } = read();
    preview.innerHTML = body.trim() ? renderMarkdown(body) : '<p class="label">The preview appears here as you write.</p>';
  };

  let saveTimer = 0;
  const save = () => {
    window.clearTimeout(saveTimer);
    saveTimer = window.setTimeout(() => {
      const { meta, body } = read();
      try {
        localStorage.setItem(KEY, toMarkdown(meta, body));
        status.textContent = "Draft saved in this browser.";
      } catch {
        status.textContent = "This browser cannot save drafts. Export to keep your text.";
      }
    }, 500);
  };

  try {
    const saved = localStorage.getItem(KEY);
    if (saved) {
      const { meta, body } = fromMarkdown(saved);
      field("title").value = meta.title ?? "";
      field("description").value = meta.description ?? "";
      field("slug").value = meta.slug ?? "";
      field("tags").value = (meta.tags ?? []).join(", ");
      field("body").value = body;
      status.textContent = "Restored your saved draft.";
    }
  } catch {
    status.textContent = "This browser cannot load saved drafts.";
  }
  render();

  form.addEventListener("input", () => {
    render();
    save();
  });

  form.querySelector("[data-export]")?.addEventListener("click", () => {
    const { meta, body } = read();
    if (!meta.title) {
      status.textContent = "Add a title before exporting.";
      field("title").focus();
      return;
    }
    const blob = new Blob([toMarkdown(meta, body)], { type: "text/markdown" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${meta.slug || slugify(meta.title)}.md`;
    link.click();
    URL.revokeObjectURL(link.href);
    status.textContent = `Exported ${link.download}. Move it into content/posts/ and remove "draft: true" to publish.`;
  });

  form.querySelector("[data-clear]")?.addEventListener("click", () => {
    if (!confirm("Clear this draft? Export it first if you want to keep it.")) return;
    form.reset();
    try {
      localStorage.removeItem(KEY);
    } catch {
      // Nothing stored to remove.
    }
    render();
    status.textContent = "Draft cleared.";
  });
}
