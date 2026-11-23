// MIRA's download figure on its project page: Hugging Face's lifetime count, read from the Hub
// when the page loads. The sentence written in the project file stays until (and unless) the
// request succeeds, so the page never shows an empty value.
const el = document.querySelector<HTMLElement>("[data-live-downloads]");

if (el) {
  const repo = el.dataset.liveDownloads!;
  const lang = el.dataset.lang === "de" ? "de" : "en";
  const url = `https://huggingface.co/api/models/${repo}?expand[]=downloadsAllTime`;

  fetch(url, { cache: "no-store", headers: { Accept: "application/json" } })
    .then((response) => (response.ok ? response.json() : Promise.reject(response.status)))
    .then((data: { downloadsAllTime?: unknown }) => {
      const count = data.downloadsAllTime;
      if (typeof count !== "number" || !Number.isFinite(count) || count < 0) return;
      const number = count.toLocaleString(lang === "de" ? "de-DE" : "en-US");
      el.textContent = lang === "de" ? `${number} Downloads insgesamt` : `${number} lifetime downloads`;
      el.dataset.live = "";
    })
    .catch(() => {
      // Offline or blocked: the static sentence from the project file stays.
    });
}
