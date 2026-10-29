"""Draws the result charts on the MIRA and MobileNet project pages.

Every number is copied from the project's own log, with the source named above each chart.
The charts are drawn in the site's colours (Tokyo Night) and in both languages, so the German
pages do not show English labels and the other way round.

    python tools/charts.py        # writes src/assets/work/<project>/<name>.<lang>.png
"""

from pathlib import Path

import matplotlib.pyplot as plt
import numpy as np

ROOT = Path(__file__).resolve().parent.parent / "src" / "assets" / "work"

# Two palettes: the dark one is Tokyo Night (the default page), the light one matches the light page
# so a chart sits on the page background in both themes.
PALETTES = {
    "dark": {
        "BG": "#1a1b26", "FG": "#c0caf5", "MUTED": "#8a93bd", "LINE": "#2f334d",
        "BLUE": "#7aa2f7", "ORANGE": "#ff9e64", "GREEN": "#9ece6a",
    },
    "light": {
        "BG": "#e6e7ed", "FG": "#1a1b26", "MUTED": "#4c5577", "LINE": "#b4b9cf",
        "BLUE": "#2e59c4", "ORANGE": "#b8590f", "GREEN": "#4d6b2a",
    },
}
THEME = "dark"
BG = FG = MUTED = LINE = BLUE = ORANGE = GREEN = ""


def use(theme):
    """Set the colours and the matplotlib defaults for one theme."""
    global THEME, BG, FG, MUTED, LINE, BLUE, ORANGE, GREEN
    THEME = theme
    p = PALETTES[theme]
    BG, FG, MUTED, LINE = p["BG"], p["FG"], p["MUTED"], p["LINE"]
    BLUE, ORANGE, GREEN = p["BLUE"], p["ORANGE"], p["GREEN"]
    plt.rcParams.update(
        {
            "font.family": "Consolas",
            "font.size": 10.5,
            "text.color": FG,
            "axes.labelcolor": MUTED,
            "xtick.color": MUTED,
            "ytick.color": MUTED,
            "axes.edgecolor": LINE,
            "axes.facecolor": BG,
            "figure.facecolor": BG,
            "savefig.facecolor": BG,
            "axes.spines.top": False,
            "axes.spines.right": False,
        }
    )


use("dark")


def frame(size=(8.0, 3.7)):
    fig, ax = plt.subplots(figsize=size)
    ax.grid(axis="y", color=LINE, linewidth=0.8)
    ax.set_axisbelow(True)
    ax.tick_params(length=0)
    return fig, ax


def title(ax, text):
    ax.set_title(text, loc="left", color=FG, fontweight="bold", fontsize=11.5, pad=14)


def save(fig, project, name, lang):
    out = ROOT / project
    out.mkdir(parents=True, exist_ok=True)
    fig.tight_layout()
    suffix = "" if THEME == "dark" else ".light"
    fig.savefig(out / f"{name}.{lang}{suffix}.png", dpi=200)
    plt.close(fig)


# MIRA -----------------------------------------------------------------------------------
# Source: MIRA-AI/results/experiments_log.md (EXP-013 to EXP-019, validation mAP50).

TEXT = {
    "en": {
        "history_title": "YOLO11n runs, mAP50 on the validation split (%)",
        "history_note": "clean, balanced dataset",
        "classes_title": "mAP50 per class (%)",
        "classes": ["glass", "metal", "paper", "plastic", "trash"],
        "sizes_title": "File size of the final model by export format (MB)",
        "sizes": ["PyTorch\n.pt", "ONNX", "LiteRT\n320 px", "LiteRT\n640 px"],
        "acc_title": "CIFAR-10 test accuracy, 10,000 images (%)",
        "size_title": "TFLite file size (MB)",
        "float": "Float32",
        "int8": "INT8",
        "old": "EXP-014 (earlier dataset)",
        "new": "EXP-018 / 019 (clean dataset)",
    },
    "de": {
        "history_title": "YOLO11n-Läufe, mAP50 auf dem Validierungssplit (%)",
        "history_note": "sauberer, ausgeglichener Datensatz",
        "classes_title": "mAP50 pro Klasse (%)",
        "classes": ["Glas", "Metall", "Papier", "Plastik", "Trash"],
        "sizes_title": "Dateigröße des finalen Modells nach Exportformat (MB)",
        "sizes": ["PyTorch\n.pt", "ONNX", "LiteRT\n320 px", "LiteRT\n640 px"],
        "acc_title": "CIFAR-10-Testgenauigkeit, 10.000 Bilder (%)",
        "size_title": "TFLite-Dateigröße (MB)",
        "float": "Float32",
        "int8": "INT8",
        "old": "EXP-014 (früherer Datensatz)",
        "new": "EXP-018 / 019 (sauberer Datensatz)",
    },
}


def num(value, lang, digits=1):
    text = f"{value:.{digits}f}"
    return text.replace(".", ",") if lang == "de" else text


def mira(lang):
    t = TEXT[lang]

    # Detector history
    runs = ["EXP-013", "EXP-014", "EXP-015", "EXP-016", "EXP-017", "EXP-018", "EXP-019"]
    values = [55.1, 60.7, 56.0, 58.8, 59.3, 90.6, 90.58]
    fig, ax = frame()
    ax.plot(runs, values, color=BLUE, linewidth=2.2, marker="o", markersize=5.5)
    ax.scatter(runs[-2:], values[-2:], color=ORANGE, s=70, zorder=3, edgecolor=BG, linewidth=1.5)
    for i, v in enumerate(values):
        label = num(v, lang, 1)
        ax.annotate(label, (i, v), textcoords="offset points", xytext=(0, 9), ha="center", fontsize=9, color=FG)
    ax.set_ylim(0, 105)
    ax.tick_params(axis="x", labelsize=9)
    ax.annotate(t["history_note"], xy=(5.5, 86), xytext=(5.5, 66), ha="center", fontsize=9.5, color=ORANGE,
                arrowprops={"arrowstyle": "-", "color": ORANGE, "linewidth": 1})
    title(ax, t["history_title"])
    save(fig, "mira", "detector-history", lang)

    # Per class, earlier dataset against the clean one
    before = np.array([50.2, 71.3, 82.9, 72.1, 26.9])
    after = np.array([90.8, 94.8, 88.7, 81.1, 97.5])
    x = np.arange(5)
    w = 0.36
    fig, ax = frame((8.0, 3.9))
    b1 = ax.bar(x - w / 2, before, w, color=MUTED, label=t["old"])
    b2 = ax.bar(x + w / 2, after, w, color=BLUE, label=t["new"])
    for bars in (b1, b2):
        for bar in bars:
            ax.annotate(num(bar.get_height(), lang), (bar.get_x() + bar.get_width() / 2, bar.get_height()),
                        textcoords="offset points", xytext=(0, 4), ha="center", fontsize=8.5, color=FG)
    ax.set_xticks(x, t["classes"])
    ax.set_ylim(0, 118)
    ax.set_yticks([0, 20, 40, 60, 80, 100])
    ax.legend(frameon=False, ncols=2, loc="upper left", labelcolor=FG, fontsize=9.5)
    title(ax, t["classes_title"])
    save(fig, "mira", "class-map", lang)

    # Export sizes
    sizes = [5.47, 10.61, 3.02, 3.04]
    fig, ax = frame((8.0, 3.3))
    bars = ax.bar(t["sizes"], sizes, color=[BLUE, MUTED, ORANGE, ORANGE], width=0.55)
    for bar in bars:
        ax.annotate(num(bar.get_height(), lang, 2), (bar.get_x() + bar.get_width() / 2, bar.get_height()),
                    textcoords="offset points", xytext=(0, 4), ha="center", fontsize=9.5, color=FG)
    ax.set_ylim(0, 12.5)
    title(ax, t["sizes_title"])
    save(fig, "mira", "export-sizes", lang)


# MobileNet ------------------------------------------------------------------------------
# Source: Mobilenet/results/comparison.md (corrected run, CIFAR-10, 128 x 128 input, alpha 0.5).


def mobilenet(lang):
    t = TEXT[lang]
    models = ["MobileNetV1", "MobileNetV2"]
    x = np.arange(2)
    w = 0.3

    fig, ax = frame((8.0, 3.7))
    f = np.array([76.72, 77.93])
    q = np.array([76.35, 77.94])
    b1 = ax.bar(x - w / 2, f, w, color=MUTED, label=t["float"])
    b2 = ax.bar(x + w / 2, q, w, color=BLUE, label=t["int8"])
    for bars in (b1, b2):
        for bar in bars:
            ax.annotate(num(bar.get_height(), lang, 2), (bar.get_x() + bar.get_width() / 2, bar.get_height()),
                        textcoords="offset points", xytext=(0, 4), ha="center", fontsize=9.5, color=FG)
    ax.set_xticks(x, models)
    ax.set_ylim(0, 100)
    ax.set_yticks([0, 25, 50, 75, 100])
    ax.legend(frameon=False, ncols=2, loc="upper left", labelcolor=FG, fontsize=9.5)
    title(ax, t["acc_title"])
    save(fig, "mobilenet-on-fpga", "accuracy", lang)

    fig, ax = frame((8.0, 3.4))
    f = np.array([3.29, 2.35])
    q = np.array([0.99, 0.85])
    b1 = ax.bar(x - w / 2, f, w, color=MUTED, label=t["float"])
    b2 = ax.bar(x + w / 2, q, w, color=ORANGE, label=t["int8"])
    for bars in (b1, b2):
        for bar in bars:
            ax.annotate(num(bar.get_height(), lang, 2), (bar.get_x() + bar.get_width() / 2, bar.get_height()),
                        textcoords="offset points", xytext=(0, 4), ha="center", fontsize=9.5, color=FG)
    ax.set_xticks(x, models)
    ax.set_ylim(0, 4.2)
    ax.legend(frameon=False, ncols=2, loc="upper right", labelcolor=FG, fontsize=9.5)
    title(ax, t["size_title"])
    save(fig, "mobilenet-on-fpga", "size", lang)


if __name__ == "__main__":
    for theme in ("dark", "light"):
        use(theme)
        for language in ("en", "de"):
            mira(language)
            mobilenet(language)
    print("charts written to", ROOT)
