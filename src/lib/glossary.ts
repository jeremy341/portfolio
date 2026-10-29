// Hover cards for links to other sites, and for the terms the writing links to. Each card has an
// English and a German text; the page reads the one for its language. Keys are the link's origin and
// path, so "https://hackclub.com" is keyed as "https://hackclub.com/".

export type Card = { title: string; text: string; image?: string };
type Entry = { en: Card; de: Card };

export const outside: Record<string, Entry> = {
  "https://huggingface.co/": {
    en: { title: "Hugging Face", text: "A website where people share machine learning models, datasets and demos. Each model page counts how often its files are requested, not how many people use the model.", image: "/previews/huggingface.png" },
    de: { title: "Hugging Face", text: "Eine Website, auf der Menschen Modelle für maschinelles Lernen, Datensätze und Demos teilen. Jede Modellseite zählt, wie oft ihre Dateien angefragt werden, nicht wie viele Menschen das Modell nutzen.", image: "/previews/huggingface.png" },
  },
  "https://huggingface.co/docs/hub/models-download-stats": {
    en: { title: "config.json", text: "The main setup file of a model. Hugging Face counts requests to it as downloads, so one person loading a model can count more than once." },
    de: { title: "config.json", text: "Die wichtigste Einstellungsdatei eines Modells. Hugging Face zählt Abfragen dieser Datei als Downloads, deshalb kann eine Person, die ein Modell lädt, mehrfach zählen." },
  },
  "https://en.wikipedia.org/wiki/Overfitting": {
    en: { title: "Benchmaxxed", text: "A model tuned so hard for one test that it scores well there but does worse in real use. The term comes from benchmark plus maxxing, and Wikipedia calls the general idea overfitting." },
    de: { title: "Benchmaxxed", text: "Ein Modell, das für einen Test so stark optimiert wurde, dass es dort gut abschneidet, im echten Einsatz aber schlechter ist. Der Begriff kommt von benchmark und maxxing; Wikipedia nennt die allgemeine Idee Overfitting." },
  },
  "https://poorup.tech/": {
    en: { title: "Poorup live demo", text: "The real-time multiplayer property game, playable in the browser without an account.", image: "/previews/poorup-demo.png" },
    de: { title: "Poorup Live-Demo", text: "Das Echtzeit-Multiplayer-Brettspiel, im Browser spielbar, ohne Konto.", image: "/previews/poorup-demo.png" },
  },
  "https://github.com/jeremy341/Poorup": {
    en: { title: "Poorup source", text: "The source code for Poorup, the real-time multiplayer property game." },
    de: { title: "Poorup Quellcode", text: "Der Quellcode von Poorup, dem Echtzeit-Multiplayer-Brettspiel." },
  },
  "https://github.com/jeremy341/MIRA-AI": {
    en: { title: "MIRA source", text: "The source code for MIRA, the waste-sorting computer vision project." },
    de: { title: "MIRA Quellcode", text: "Der Quellcode von MIRA, dem Computer-Vision-Projekt zur Abfallsortierung." },
  },
  "https://huggingface.co/Jeremy341/MIRA-AI": {
    en: { title: "MIRA model files", text: "The MIRA models on Hugging Face. The download counter counts fetches, not people." },
    de: { title: "MIRA-Modelldateien", text: "Die MIRA-Modelle auf Hugging Face. Der Download-Zähler zählt Abrufe, nicht Personen." },
  },
  "https://huggingface.co/Jeremy341": {
    en: { title: "Hugging Face profile", text: "Jeremy's Hugging Face profile, with the MIRA models." },
    de: { title: "Hugging-Face-Profil", text: "Jeremys Hugging-Face-Profil mit den MIRA-Modellen." },
  },
  "https://pypi.org/": {
    en: { title: "PyPI", text: "The Python Package Index, where Python libraries are published so others can install them." },
    de: { title: "PyPI", text: "Der Python Package Index, auf dem Python-Bibliotheken veröffentlicht werden, damit andere sie installieren können." },
  },
  "https://pypi.org/project/mira-ai/": {
    en: { title: "mira-ai on PyPI", text: "The mira-ai Python package, which bundles the MIRA models." },
    de: { title: "mira-ai auf PyPI", text: "Das Python-Paket mira-ai, das die MIRA-Modelle enthält." },
  },
  "https://mira-vision.vercel.app/": {
    en: { title: "MIRA website", text: "The MIRA project website.", image: "/previews/mira-site.png" },
    de: { title: "MIRA-Website", text: "Die Projektwebsite von MIRA.", image: "/previews/mira-site.png" },
  },
  "https://github.com/jeremy341/abi-vault": {
    en: { title: "AbiVault source", text: "The source code for AbiVault, a shared money workspace for school committees." },
    de: { title: "AbiVault Quellcode", text: "Der Quellcode von AbiVault, einem gemeinsamen Geldbereich für Schulkomitees." },
  },
  "https://abi-vault-demo.vercel.app/": {
    en: { title: "AbiVault demo", text: "A live demo of AbiVault with sample data. It isn't meant for real financial data.", image: "/previews/abivault-demo.png" },
    de: { title: "AbiVault-Demo", text: "Eine Live-Demo von AbiVault mit Beispieldaten. Sie ist nicht für echte Finanzdaten gedacht.", image: "/previews/abivault-demo.png" },
  },
  "https://github.com/jeremy341/TorchVK": {
    en: { title: "TorchVK source", text: "The source code for TorchVK, an early research plan for PyTorch training through Vulkan." },
    de: { title: "TorchVK Quellcode", text: "Der Quellcode von TorchVK, einem frühen Forschungsplan für PyTorch-Training über Vulkan." },
  },
  "https://github.com/jeremy341/Mobilenet-fpga": {
    en: { title: "Mobilenet-fpga source", text: "The source code for the MobileNet quantization work. It has no FPGA code yet." },
    de: { title: "Mobilenet-fpga Quellcode", text: "Der Quellcode der MobileNet-Quantisierung. Er enthält noch keinen FPGA-Code." },
  },
  "https://github.com/jeremy341/microdroplets-ui": {
    en: { title: "Microdroplets UI source", text: "The source code for Microdroplets UI, which contains FluidicStudio." },
    de: { title: "Microdroplets UI Quellcode", text: "Der Quellcode von Microdroplets UI, in dem FluidicStudio steckt." },
  },
  "https://github.com/jeremy341/esp32-alarm-clock": {
    en: { title: "ESP32 alarm clock source", text: "The source code for the ESP32 alarm clock, my first real project." },
    de: { title: "ESP32-Wecker Quellcode", text: "Der Quellcode des ESP32-Weckers, mein erstes richtiges Projekt." },
  },
  "https://github.com/jeremy341": {
    en: { title: "GitHub profile", text: "Jeremy's GitHub profile." },
    de: { title: "GitHub-Profil", text: "Jeremys GitHub-Profil." },
  },
  "https://de.linkedin.com/in/jeremy-darko-a0a850413": {
    en: { title: "LinkedIn profile", text: "Jeremy's LinkedIn profile." },
    de: { title: "LinkedIn-Profil", text: "Jeremys LinkedIn-Profil." },
  },
  "https://www.uni-due.de/ebs/": {
    en: { title: "EBS chair", text: "The Chair of Electronic Components and Circuits at the University of Duisburg-Essen, where I did my internship.", image: "/previews/ebs-chair.png" },
    de: { title: "EBS-Lehrstuhl", text: "Der Lehrstuhl für Elektronische Bauelemente und Schaltungen an der Universität Duisburg-Essen, wo ich mein Praktikum gemacht habe.", image: "/previews/ebs-chair.png" },
  },
  "https://stardance.space/certificate": {
    en: { title: "Certificate check", text: "The Stardance certificate page, where you enter a reference code to verify a certificate.", image: "/previews/stardance-certificate.png" },
    de: { title: "Zertifikatsprüfung", text: "Die Prüfseite für Stardance-Zertifikate. Dort gibt man einen Referenzcode ein, um ein Zertifikat zu prüfen.", image: "/previews/stardance-certificate.png" },
  },
  "https://hackclub.com/": {
    en: { title: "Hack Club", text: "A nonprofit movement of teenagers making cool projects. Stardance and Loadout are both Hack Club programs.", image: "/previews/hackclub.webp" },
    de: { title: "Hack Club", text: "Eine gemeinnützige Bewegung von Jugendlichen, die coole Projekte bauen. Stardance und Loadout sind beides Hack-Club-Programme.", image: "/previews/hackclub.webp" },
  },
  "https://stardance.hackclub.com/": {
    en: { title: "Stardance", text: "A free online summer program for teens 13 to 18. Build a project, log your hours and earn prizes.", image: "/previews/stardance.webp" },
    de: { title: "Stardance", text: "Ein kostenloses Online-Sommerprogramm für Jugendliche von 13 bis 18. Ein Projekt bauen, Stunden erfassen und Preise gewinnen.", image: "/previews/stardance.webp" },
  },
  "https://project.hackclub.com/overview/info/": {
    en: { title: "YSWS", text: "You Ship, We Ship: a Hack Club model where you build and ship a project and get a reward back.", image: "/previews/ysws.webp" },
    de: { title: "YSWS", text: "You Ship, We Ship: ein Hack-Club-Modell, bei dem man ein Projekt baut, veröffentlicht und dafür eine Belohnung bekommt.", image: "/previews/ysws.webp" },
  },
  "https://loadout.dino.icu/": {
    en: { title: "LOADOUT", text: "A proposal YSWS that would let people come to Germany for free for a three-day hackathon if they create enough projects.", image: "/previews/loadout.webp" },
    de: { title: "LOADOUT", text: "Ein Vorschlag für eine YSWS, mit der Leute für einen kostenlosen dreitägigen Hackathon nach Deutschland kommen könnten, wenn sie genug Projekte bauen.", image: "/previews/loadout.webp" },
  },
  "https://bambulab.com/": {
    en: { title: "Bambu Lab", text: "A 3D printer maker. Jeremy got a Bambu Lab printer for free because of Poorup.", image: "/previews/bambulab.webp" },
    de: { title: "Bambu Lab", text: "Ein Hersteller von 3D-Druckern. Jeremy hat dank Poorup einen Bambu-Lab-Drucker kostenlos bekommen.", image: "/previews/bambulab.webp" },
  },
  "https://stasis.hackclub.com/": {
    en: { title: "Stasis", text: "A Hack Club program where you design and build hardware projects and get money for the parts." },
    de: { title: "Stasis", text: "Ein Hack-Club-Programm, bei dem man Hardware-Projekte entwirft und baut und Geld für die Teile bekommt." },
  },
  "https://dino-lite.eu/": {
    en: { title: "Dino-Lite", text: "A brand of USB digital microscopes. FluidicStudio is built to work with one of them." },
    de: { title: "Dino-Lite", text: "Eine Marke für USB-Digitalmikroskope. FluidicStudio ist für eines davon gebaut." },
  },
  "https://www.bartels-mikrotechnik.de/": {
    en: { title: "Bartels Mikrotechnik", text: "A company in Dortmund that makes micropumps for liquids and gases." },
    de: { title: "Bartels Mikrotechnik", text: "Ein Unternehmen aus Dortmund, das Mikropumpen für Flüssigkeiten und Gase baut." },
  },
  "https://sensirion.com/": {
    en: { title: "Sensirion", text: "A Swiss maker of sensors, including the liquid flow sensor whose readings FluidicStudio logs." },
    de: { title: "Sensirion", text: "Ein Schweizer Hersteller von Sensoren, unter anderem des Durchflusssensors, dessen Messwerte FluidicStudio aufzeichnet." },
  },
  "https://www.ultralytics.com/": {
    en: { title: "Ultralytics", text: "The company behind YOLO, the detection models I trained MIRA with." },
    de: { title: "Ultralytics", text: "Die Firma hinter YOLO, den Erkennungsmodellen, mit denen ich MIRA trainiert habe." },
  },
  "https://docs.ultralytics.com/": {
    en: { title: "YOLO", text: "A family of fast object detection models. MIRA uses YOLO11n, a small version." },
    de: { title: "YOLO", text: "Eine Familie schneller Modelle zur Objekterkennung. MIRA nutzt YOLO11n, eine kleine Version." },
  },
  "https://www.kaggle.com/": {
    en: { title: "Kaggle", text: "A data science platform with free notebooks that include GPUs." },
    de: { title: "Kaggle", text: "Eine Data-Science-Plattform mit kostenlosen Notebooks, die GPUs enthalten." },
  },
  "https://colab.research.google.com/": {
    en: { title: "Google Colab", text: "Google's free notebook service with GPUs for running Python." },
    de: { title: "Google Colab", text: "Googles kostenloser Notebook-Dienst mit GPUs zum Ausführen von Python." },
  },
  "https://roboflow.com/": {
    en: { title: "Roboflow", text: "A platform for building and sharing image datasets for computer vision." },
    de: { title: "Roboflow", text: "Eine Plattform zum Aufbauen und Teilen von Bilddatensätzen für Computer Vision." },
  },
  "https://tacodataset.org/": {
    en: { title: "TACO", text: "A dataset of photos of litter, labelled for detection." },
    de: { title: "TACO", text: "Ein Datensatz mit Fotos von Müll, beschriftet für die Erkennung." },
  },
  "https://github.com/garythung/trashnet": {
    en: { title: "TrashNet", text: "A dataset of waste photos, first made as a Stanford University project." },
    de: { title: "TrashNet", text: "Ein Datensatz mit Müllfotos, ursprünglich als Projekt der Stanford University entstanden." },
  },
  "https://github.com/FoundationVision/ByteTrack": {
    en: { title: "ByteTrack", text: "A method that follows objects from frame to frame in a video." },
    de: { title: "ByteTrack", text: "Eine Methode, die Objekte von Bild zu Bild in einem Video verfolgt." },
  },
  "https://socket.io/": {
    en: { title: "Socket.IO", text: "A library for real-time messages between a browser and a server." },
    de: { title: "Socket.IO", text: "Eine Bibliothek für Echtzeit-Nachrichten zwischen Browser und Server." },
  },
  "https://fastapi.tiangolo.com/": {
    en: { title: "FastAPI", text: "A Python framework for building web APIs and dashboards." },
    de: { title: "FastAPI", text: "Ein Python-Framework zum Bauen von Web-APIs und Dashboards." },
  },
  "https://opencv.org/": {
    en: { title: "OpenCV", text: "An open-source library for camera and image processing." },
    de: { title: "OpenCV", text: "Eine Open-Source-Bibliothek für Kamera- und Bildverarbeitung." },
  },
  "https://riverbankcomputing.com/software/pyqt/": {
    en: { title: "PyQt6", text: "Python bindings for Qt, a toolkit for building desktop windows and buttons." },
    de: { title: "PyQt6", text: "Python-Anbindung für Qt, einen Werkzeugkasten für Desktop-Fenster und Schaltflächen." },
  },
  "https://www.vulkan.org/": {
    en: { title: "Vulkan", text: "A graphics and compute API that runs on most modern GPUs." },
    de: { title: "Vulkan", text: "Eine Grafik- und Compute-Schnittstelle, die auf fast allen modernen GPUs läuft." },
  },
  "https://pytorch.org/": {
    en: { title: "PyTorch", text: "A machine learning framework for Python." },
    de: { title: "PyTorch", text: "Ein Framework für maschinelles Lernen in Python." },
  },
  "https://onnx.ai/": {
    en: { title: "ONNX", text: "An open format for machine learning models, so they can run in different tools." },
    de: { title: "ONNX", text: "Ein offenes Format für Machine-Learning-Modelle, damit sie in verschiedenen Werkzeugen laufen." },
  },
  "https://www.tensorflow.org/lite": {
    en: { title: "TensorFlow Lite", text: "A format and runtime for running small models on phones and other devices." },
    de: { title: "TensorFlow Lite", text: "Ein Format und eine Laufzeit, um kleine Modelle auf Handys und anderen Geräten laufen zu lassen." },
  },
  "https://ai.google.dev/edge/litert": {
    en: { title: "LiteRT", text: "Google's runtime for running models on devices, the newer name for TensorFlow Lite." },
    de: { title: "LiteRT", text: "Googles Laufzeit für Modelle auf Geräten, der neuere Name für TensorFlow Lite." },
  },
  "https://codescene.com/": {
    en: { title: "CodeScene", text: "A tool that scores code health and flags complex files." },
    de: { title: "CodeScene", text: "Ein Werkzeug, das die Code-Gesundheit bewertet und komplexe Dateien markiert." },
  },
  "https://clerk.com/": {
    en: { title: "Clerk", text: "A service for sign-in and user organizations in web apps." },
    de: { title: "Clerk", text: "Ein Dienst für Anmeldung und Organisationen in Web-Apps." },
  },
  "https://supabase.com/": {
    en: { title: "Supabase", text: "A hosted PostgreSQL database with file storage and security rules." },
    de: { title: "Supabase", text: "Eine gehostete PostgreSQL-Datenbank mit Dateispeicher und Sicherheitsregeln." },
  },
  "https://nextjs.org/": {
    en: { title: "Next.js", text: "A React framework for building web apps." },
    de: { title: "Next.js", text: "Ein React-Framework zum Bauen von Web-Apps." },
  },
  "https://www.ims.fraunhofer.de/": {
    en: { title: "Fraunhofer IMS", text: "A Fraunhofer institute for microelectronic systems, based in Duisburg." },
    de: { title: "Fraunhofer IMS", text: "Ein Fraunhofer-Institut für mikroelektronische Systeme mit Sitz in Duisburg." },
  },
  "https://openai.com/": {
    en: { title: "OpenAI", text: "The company behind the GPT models and Codex, a coding assistant." },
    de: { title: "OpenAI", text: "Das Unternehmen hinter den GPT-Modellen und Codex, einem Assistenten für Code." },
  },
  "https://www.jugend-forscht.de/": {
    en: { title: "Jugend forscht", text: "A German competition for young researchers." },
    de: { title: "Jugend forscht", text: "Ein deutscher Wettbewerb für junge Forscherinnen und Forscher." },
  },
  "https://www.roblox.com/": {
    en: { title: "Roblox", text: "An online platform where people make and play games." },
    de: { title: "Roblox", text: "Eine Online-Plattform, auf der Menschen Spiele bauen und spielen." },
  },
  "https://scratch.mit.edu/": {
    en: { title: "Scratch", text: "A block-based programming language for beginners, from MIT." },
    de: { title: "Scratch", text: "Eine blockbasierte Programmiersprache für Einsteiger, vom MIT." },
  },
  "https://cs50.harvard.edu/": {
    en: { title: "CS50", text: "Harvard's introduction to computer science, free online." },
    de: { title: "CS50", text: "Harvards Einführung in die Informatik, kostenlos online." },
  },
  "https://www.leagueoflegends.com/": {
    en: { title: "League of Legends", text: "A team-based online game." },
    de: { title: "League of Legends", text: "Ein Online-Teamspiel." },
  },
  "https://www.minecraft.net/": {
    en: { title: "Minecraft", text: "A sandbox game about building with blocks." },
    de: { title: "Minecraft", text: "Ein Sandbox-Spiel, bei dem man mit Blöcken baut." },
  },
};

/** The cards for outside links, in the language of the page. */
export function outsidePreviews(lang: "en" | "de"): Record<string, Card> {
  return Object.fromEntries(Object.entries(outside).map(([url, entry]) => [url, entry[lang]]));
}
