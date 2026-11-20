// The two languages of the site. English lives at the root, German under /de/. Every word the
// pages and scripts show that does not come from /content is in this file, so a missing German
// string is a type error (`de` must have every key of `en`).

export type Lang = "en" | "de";
export const langs: readonly Lang[] = ["en", "de"];

export const prefix = (lang: Lang) => (lang === "de" ? "/de" : "");

/** A site path (starting with "/") in the given language. */
export const url = (lang: Lang, path: string) => prefix(lang) + path;

/** The same page in the other language: /de/work/ <-> /work/. */
export function otherPath(pathname: string, to: Lang): string {
  const bare = pathname.replace(/^\/de(?=\/|$)/, "") || "/";
  return url(to, bare);
}

export const langOf = (value: string | undefined | null): Lang => (value === "de" ? "de" : "en");

/** The sections of the site, in the order of the top bar, the home index and the home keys. */
export const sections = [
  { id: "work", path: "/work/" },
  { id: "writing", path: "/blog/" },
  { id: "certificates", path: "/certificates/" },
  { id: "about", path: "/about/" },
  { id: "contact", path: "/contact/" },
] as const;

// One sentence about the person, used after "Jeremy Darko is" and after "About Jeremy Darko:".
const summary = {
  en: "a student from North Rhine-Westphalia, Germany, who builds in machine learning, GPU computing and hardware.",
  de: "ein Schüler aus Nordrhein-Westfalen, der an Projekten rund um Machine Learning, GPU-Computing und Hardware arbeitet.",
};

const en = {
  htmlLang: "en",
  dateLocale: "en-GB",
  ogLocale: "en_GB",
  description: "Official portfolio of Jeremy Darko (Jeremy Yeboah Darko), a student in Germany building projects in computer engineering, machine learning, GPU computing and hardware.",
  homeTitle: "Computer engineering, machine learning, GPU computing and hardware",
  jobTitle: "Student builder",
  personDescription: (name: string) => `${name} is ${summary.en}`,
  region: "North Rhine-Westphalia",
  shareAlt: "Jeremy Darko: student builder in machine learning, GPU computing and hardware.",
  feedTitle: "Jeremy Darko: writing",

  nav: { work: "Work", writing: "Blog", certificates: "Certificates", about: "About", contact: "Contact" },
  homeKeys: ["w", "b", "e", "a", "c"],
  homeDetail: (projects: number, articles: number, certificates: number) => [
    `${projects} projects`,
    `${articles} articles`,
    `${certificates} certificates`,
    "About me and what I'm into",
    "Where to find me",
  ],
  sections: "Sections",
  mainNav: "Main",
  menu: "Menu",
  skip: "Skip to content",
  search: "Search",
  commandLine: "Command line",
  language: "Language",
  languageName: { en: "English", de: "Deutsch" },

  workTitle: "Work",
  workLead: (n: number) => `${n} projects, each with its honest status.`,
  workDescription: (name: string) => `Projects by ${name}: machine learning, GPU computing, hardware and games, each with its honest status.`,
  filterBy: "Filter by category",
  all: "All",
  filterNote: (shown: number, total: number) => `${shown} of ${total} projects`,
  projectsAria: "Projects",

  why: "Why it exists",
  how: "How it works",
  numbers: "In numbers",
  figures: "Figures",
  where: "Where it stands",
  links: "Links",
  status: "Status",
  category: "Category",
  builtWith: "Built with",
  onThisPage: "On this page",
  projectRecord: "Project record",
  moreProjects: "More projects",
  previous: "[ previous",
  next: "next ]",
  projectDescription: (name: string, summary: string, status: string) => `${name}: ${summary} Status: ${status}.`,
  linkLabel: {
    source: "Source on GitHub",
    site: "Project website",
    demo: "Live demo",
    models: "Models on Hugging Face",
    package: "Package on PyPI",
    article: "Read the article",
  },
  // The short names on the row of links under the project's summary.
  linkShort: { source: "GitHub", site: "Website", demo: "Live demo", models: "Hugging Face", package: "PyPI", article: "Article" },
  linksAria: "Where to find the project",
  figureOpen: "Open the full-size image",
  figureViewer: "Image viewer",
  figureZoom: "tap to zoom",
  figureFit: "tap to fit",
  figureZoomButton: "Zoom in",
  figureFitButton: "Fit to screen",
  figureClose: "Close image",
  figureNo: (n: number) => `fig ${String(n).padStart(2, "0")}`,

  writingTitle: "Writing",
  writingDescription: (name: string) => `Writing by ${name} on machine-learning systems, computer engineering and learning by building.`,
  articlesAria: "Articles",
  minRead: (n: number) => `${n} min read`,
  updated: "updated",
  older: "Older:",
  newer: "Newer:",
  moreWriting: "More writing",

  certificatesTitle: "Certificates",
  certificatesLead: (n: number) => `${n} certificates and references, each with who issued it.`,
  certificatesDescription: (name: string) => `Certificates and references of ${name}: who issued each one, when, and what it is for.`,
  certificatesAria: "Certificates",
  certFacts: { issuer: "Issued by", kind: "Kind", date: "Date", reference: "Reference", verify: "Check it" },
  inspectCertificate: "Inspect the certificate",
  hideCertificate: "Hide the certificate",

  aboutTitle: "About",
  aboutDescription: (name: string) => `About ${name}: ${summary.en}`,
  notes: {
    now: { title: "Now", description: "Dated notes on what Jeremy Darko is working on and writing about." },
  },
  backHome: "Back to home",

  contactTitle: "Contact",
  contactDescription: (name: string) => `Contact ${name} for a project question, an idea to explore or an internship conversation.`,

  cvTitle: "CV",
  cvDescription: (name: string) => `CV of ${name}: experience, school, skills and personal projects.`,
  cvPdf: "Download PDF (English)",

  notFoundTitle: "Page not found",
  notFoundDescription: "This page does not exist.",
  notFoundText: "The link may be old, or the page has moved.",
  notFoundBack: "Back to the work",
  notFoundHint: "Click the water to feed the koi",
  notFoundQuest: "catch the koi to find your way back",
  notFoundFound: "found them. the link above leads to the work",
  notFoundError: "no such file",

  // Search index (/search.json)
  idxHomeTitle: "Home",
  idxHome: "The numbered index of the five sections.",
  idxWork: (n: number) => `${n} projects, each with its honest status.`,
  idxWriting: (n: number) => `${n} articles on machine-learning systems and learning by building.`,
  idxContact: "Email, my CV and where to find me online.",
  idxCertificates: (n: number) => `${n} certificates and references with their issuer.`,
  idxKinds: { index: "index", projects: "projects", articles: "articles", certificates: "certificates", profile: "profile", profiles: "profiles", cv: "cv" },
  idxContactTags: ["email"],
  idxCvTitle: "CV",
  idxCvTags: ["cv", "resume", "lebenslauf"],

  // Editor chrome and scripts
  soundOn: "sound on",
  soundOff: "sound off",
  keysOn: "keys on",
  keysOff: "keys off",
  themeDark: "dark mode",
  themeLight: "light mode",
  preview: { button: (title: string) => `Preview: ${title}`, close: "Close preview", open: "Open page" },
  help: "/ search   j k rows or scroll   d u scroll   gg G top bottom   yy copy link   H back   w b e a c sections   :e {file}   :set nokeys   :set nosound   :set light   :set dark   :intro   :q",
  copied: "copied",
  finder: {
    placeholder: "Search projects, writing and pages",
    close: "Close search",
    hint: "up/down move   enter open   esc close",
    kinds: { page: "page", project: "work", post: "text" },
    results: (n: number) => `${n} results`,
    none: "No results",
    unavailable: "Search is unavailable.",
    failed: "The search index could not be loaded.",
    nothing: (query: string) => `Nothing matches "${query}".`,
    loading: "Loading...",
    inText: "in the text  ",
    searchAria: "Search",
    resultsAria: "Results",
  },
  langAnnounce: "Language",
};

type Strings = typeof en;

const de: Strings = {
  htmlLang: "de",
  dateLocale: "de-DE",
  ogLocale: "de_DE",
  description: "Portfolio von Jeremy Darko (Jeremy Yeboah Darko), Schüler aus NRW. Projekte rund um Computer Engineering, Machine Learning, GPU-Computing und Hardware.",
  homeTitle: "Computer Engineering, Machine Learning, GPU-Computing und Hardware",
  jobTitle: "Schüler und Entwickler",
  personDescription: (name: string) => `${name} ist ${summary.de}`,
  region: "Nordrhein-Westfalen",
  shareAlt: "Jeremy Darko: Schüler und Entwickler für Machine Learning, GPU-Computing und Hardware.",
  feedTitle: "Jeremy Darko: Blog",

  nav: { work: "Projekte", writing: "Blog", certificates: "Zertifikate", about: "Über mich", contact: "Kontakt" },
  homeKeys: ["p", "t", "z", "m", "c"],
  homeDetail: (projects, articles, certificates) => [
    `${projects} Projekte`,
    `${articles} Artikel`,
    `${certificates} Zertifikate`,
    "Wer ich bin und was mich interessiert",
    "So erreichst du mich",
  ],
  sections: "Bereiche",
  mainNav: "Hauptnavigation",
  menu: "Menü",
  skip: "Zum Inhalt springen",
  search: "Suche",
  commandLine: "Kommandozeile",
  language: "Sprache",
  languageName: { en: "English", de: "Deutsch" },

  workTitle: "Projekte",
  workLead: (n) => `${n} Projekte. Mit dem Stand, den sie wirklich haben.`,
  workDescription: (name) => `Projekte von ${name} rund um Machine Learning, GPU-Computing, Hardware und Spiele, mit ihrem tatsächlichen Entwicklungsstand.`,
  filterBy: "Nach Kategorie filtern",
  all: "Alle",
  filterNote: (shown, total) => `${shown} von ${total} Projekten`,
  projectsAria: "Projekte",

  why: "Wie es dazu kam",
  how: "Wie es funktioniert",
  numbers: "In Zahlen",
  figures: "Abbildungen",
  where: "Aktueller Stand",
  links: "Links",
  status: "Status",
  category: "Kategorie",
  builtWith: "Gebaut mit",
  onThisPage: "Auf dieser Seite",
  projectRecord: "Projekt auf einen Blick",
  moreProjects: "Weitere Projekte",
  previous: "[ zurück",
  next: "weiter ]",
  projectDescription: (name, summary, status) => `${name}: ${summary} Stand: ${status}.`,
  linkLabel: {
    source: "Quellcode auf GitHub",
    site: "Projektwebsite",
    demo: "Live-Demo",
    models: "Modelle auf Hugging Face",
    package: "Paket auf PyPI",
    article: "Artikel lesen",
  },
  linkShort: { source: "GitHub", site: "Website", demo: "Live-Demo", models: "Hugging Face", package: "PyPI", article: "Artikel" },
  linksAria: "Links zum Projekt",
  figureOpen: "Bild in voller Größe öffnen",
  figureViewer: "Bildansicht",
  figureZoom: "zum Zoomen tippen",
  figureFit: "zum Einpassen tippen",
  figureZoomButton: "Vergrößern",
  figureFitButton: "An Bildschirm anpassen",
  figureClose: "Bild schließen",
  figureNo: (n) => `Abb. ${String(n).padStart(2, "0")}`,

  writingTitle: "Blog",
  writingDescription: (name) => `${name} schreibt über Machine Learning, Computer Engineering und was er bei eigenen Projekten lernt.`,
  articlesAria: "Artikel",
  minRead: (n) => `${n} Min. Lesezeit`,
  updated: "aktualisiert",
  older: "Älter:",
  newer: "Neuer:",
  moreWriting: "Weitere Artikel",

  certificatesTitle: "Zertifikate",
  certificatesLead: (n) => `${n} Zertifikate und Bescheinigungen. Bei jedem steht dabei, wer es ausgestellt hat.`,
  certificatesDescription: (name) => `Zertifikate und Bescheinigungen von ${name}: wer sie ausgestellt hat, wann und wofür.`,
  certificatesAria: "Zertifikate",
  certFacts: { issuer: "Ausgestellt von", kind: "Art", date: "Datum", reference: "Kennung", verify: "Prüfen" },
  inspectCertificate: "Zertifikat ansehen",
  hideCertificate: "Zertifikat ausblenden",

  aboutTitle: "Über mich",
  aboutDescription: (name) => `Über ${name}: ${summary.de}`,
  notes: {
    now: { title: "Aktuell", description: "Notizen dazu, woran Jeremy Darko gerade arbeitet und worüber er schreibt." },
  },
  backHome: "Zur Startseite",

  contactTitle: "Kontakt",
  contactDescription: (name) => `${name} kontaktieren: Fragen zu Projekten, Ideen für eine Zusammenarbeit oder Praktikumsmöglichkeiten.`,

  cvTitle: "Lebenslauf",
  cvDescription: (name) => `Lebenslauf von ${name}: Praktika, Schule, Kenntnisse und eigene Projekte.`,
  cvPdf: "Als PDF herunterladen",

  notFoundTitle: "Seite nicht gefunden",
  notFoundDescription: "Diese Seite gibt es nicht.",
  notFoundText: "Vielleicht ist der Link veraltet oder die Seite ist umgezogen.",
  notFoundBack: "Zurück zu den Projekten",
  notFoundHint: "Klicke ins Wasser, um die Koi zu füttern",
  notFoundQuest: "fange die Koi, um den Weg zurück zu finden",
  notFoundFound: "gefunden. der Link oben führt zu den Projekten",
  notFoundError: "keine solche Datei",

  idxHomeTitle: "Start",
  idxHome: "Die Übersicht über die fünf Bereiche der Website.",
  idxWork: (n) => `${n} Projekte. Mit dem Stand, den sie wirklich haben.`,
  idxWriting: (n) => `${n} Artikel über Technik und die Erfahrungen hinter meinen Projekten.`,
  idxContact: "E-Mail, mein Lebenslauf und wo du mich online findest.",
  idxCertificates: (n) => `${n} Zertifikate und Bescheinigungen mit Angaben zur Herkunft.`,
  idxKinds: { index: "index", projects: "projekte", articles: "artikel", certificates: "zertifikate", profile: "profil", profiles: "profile", cv: "lebenslauf" },
  idxContactTags: ["email", "e-mail"],
  idxCvTitle: "Lebenslauf",
  idxCvTags: ["cv", "resume", "lebenslauf"],

  soundOn: "Ton an",
  soundOff: "Ton aus",
  keysOn: "Tastenkürzel an",
  keysOff: "Tastenkürzel aus",
  themeDark: "Dunkelmodus",
  themeLight: "Hellmodus",
  preview: { button: (title: string) => `Vorschau: ${title}`, close: "Vorschau schließen", open: "Seite öffnen" },
  help: "/ suchen   j k Zeilen oder scrollen   d u scrollen   gg G Anfang Ende   yy Link kopieren   H zurück   p t z m c Bereiche   :e {Datei}   :set nokeys   :set nosound   :set light   :set dark   :intro   :q",
  copied: "kopiert",
  finder: {
    placeholder: "Projekte, Artikel und Seiten durchsuchen",
    close: "Suche schließen",
    hint: "↑/↓ auswählen   Enter öffnen   Esc schließen",
    kinds: { page: "Seite", project: "Projekt", post: "Artikel" },
    results: (n) => `${n} Treffer`,
    none: "Keine Treffer",
    unavailable: "Die Suche ist nicht verfügbar.",
    failed: "Der Suchindex konnte nicht geladen werden.",
    nothing: (query) => `Keine Treffer für „${query}“.`,
    loading: "Lädt...",
    inText: "im Text  ",
    searchAria: "Suche",
    resultsAria: "Treffer",
  },
  langAnnounce: "Sprache",
};

export const ui: Record<Lang, Strings> = { en, de };

/** The `lang` route parameter for every language: undefined is the root (English). */
export const langParams = () => langs.map((code) => ({ params: { lang: code === "en" ? undefined : code } }));
