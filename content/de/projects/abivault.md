# AbiVault

- Ursprüngliche Inhalts-ID: abi
- Kategorie: Spiele & Software
- Status: Privates Projekt
- Technologien und Themen: Next.js, TypeScript, Supabase

## Zusammenfassung

Ein Finanz-Dashboard für Abikomitees. Ich wollte einen Weg finden, die gemeinsame Abikasse zu verwalten, bei dem nicht alles davon abhängt, wer gerade Zugriff auf eine Tabelle hat.

## Story

Über die Jahre habe ich erstaunlich viele Geschichten von Abschlussjahrgängen gehört, die Geld für ihre Abifeiern gesammelt hatten und hinterher Schwierigkeiten hatten zu erklären, wo es eigentlich geblieben war. Mal klang es nach schlechter Buchführung, mal bestand der Verdacht, dass Geld ohne Erlaubnis ausgegeben worden war.

Ich kann diese Geschichten nicht überprüfen und möchte niemandem an meiner eigenen Schule etwas unterstellen. Aber sie haben mich zum Nachdenken gebracht: Warum hängt die Verwaltung des Geldes von Dutzenden Schülern manchmal an einer Tabelle, die sich nur ein paar Leute richtig ansehen können?

Eine Tabelle verrät dir, was jemand *eingetragen* hat. Nicht unbedingt, wer etwas geändert hat, ob der Betrag stimmte oder was danach mit dem Geld passiert ist.

Genau da sollte AbiVault ansetzen.

{{figure:0}}

### Sagen wir, es fehlen 40 €

Ein Schüler stellt eine ziemlich berechtigte Frage: „Wo sind die 40 Euro hin?“

Wenn die einzige Antwort eine Zeile in einer Tabelle mit dem Eintrag „Deko“ ist, was wissen wir dann eigentlich? Jemand hat eine Ausgabe eingetragen. Wer sie freigegeben hat, ob es einen Beleg gibt oder ob der Betrag später geändert wurde, wissen wir vielleicht nicht.

Statt mit einem hübschen Dashboard anzufangen, wollte ich deshalb zuerst überlegen, welche Informationen wir brauchen, um die Frage beantworten zu können. Eine Transaktion benötigt einen nachvollziehbaren Betrag und einen Zweck. Sie muss zu einem konsistenten Kontostand passen. Es sollte klar sein, wer sie ändern darf, und wichtige Änderungen sollten Spuren hinterlassen.

Natürlich garantiert das nicht, dass alle ehrlich sind. Aber wenn etwas schiefgeht, hat man lieber nachvollziehbare Aufzeichnungen, als darauf zu hoffen, dass sich alle noch daran erinnern.

Selbst hinter der ersten Anforderung steckt allerdings ein technisches Detail. Wie speichert man einen Betrag eigentlich *korrekt*?

### Was nützt eine Prüfung, wenn schon die Zahl nicht stimmt?

Computer arbeiten bei vielen Berechnungen mit Gleitkommazahlen. Das funktioniert oft gut, nur lassen sich in binären Gleitkommaformaten nicht alle Dezimalbrüche exakt darstellen.

Bei einem Grafikexperiment ist ein winziger Rundungsfehler vielleicht egal. In der Buchhaltung möchte ich solche vermeidbaren Überraschungen gar nicht erst haben.

AbiVault speichert Beträge daher als **ganzzahlige Centbeträge**, bei Bedarf mit `bigint`. Aus 40,10 € werden 4010 Cent, keine angenäherte Gleitkommazahl.

Das löst das Problem der Zahlendarstellung. Aber zurück zu unseren fehlenden 40 Euro: Selbst ein perfekt gespeicherter Betrag erklärt nicht, wo das Geld geblieben ist, wenn die einzige Information ein beliebig änderbares Feld namens „Kontostand“ ist.

Deshalb verwendet das System ein **Buchungsjournal** und ausgeglichene Buchungen. Bei der doppelten Buchführung stehen einer gebuchten Bewegung passende Soll- und Haben-Buchungen gegenüber. So entsteht ein nachvollziehbarer Buchungsverlauf statt einer einzelnen Summe, die man einfach überschreiben kann.

Das Journal kann intern konsistent sein. Es kann aber nicht beweisen, dass ein Einkauf berechtigt war oder ein Beleg echt ist. Bleibt also die Frage, wer diese Buchungen überhaupt eintragen, freigeben oder ändern darf.

### Nicht jeder darf die Antwort nachträglich ändern

AbiVault unterscheidet zwischen Administratoren, Aufsichtspersonen und Schülern. Schüler sehen einen eingeschränkten Ausschnitt der Finanzen, während die für das Komitee verantwortlichen Personen die zu ihrer Rolle passenden Berechtigungen bekommen.

Für Anmeldung und Organisationen verwende ich [Clerk](https://clerk.com/), für die Finanzdaten [Supabase](https://supabase.com/) mit PostgreSQL. Eine besonders wichtige Funktion ist dabei **Row Level Security (RLS)**.

Bei RLS setzt die Datenbank selbst Regeln dafür durch, welche Zeilen eine Anfrage lesen oder verändern darf. Wenn jemand aus einem Abikomitee eine ID in einer Browseranfrage ändert, sollte er dadurch nicht plötzlich die Transaktionen eines anderen Komitees sehen können.

Dafür reicht es nicht, den Bearbeiten-Button auszublenden. Die UI läuft im Browser des Nutzers. Die Berechtigungen müssen dahinter geprüft werden.

Zugriffskontrolle beantwortet aber erst mal nur, wer *jetzt* etwas tun darf. Angenommen, jemand durfte gestern eine Buchung ändern. Können wir nächsten Monat noch nachvollziehen, was er geändert hat?

Wichtige Aktionen erzeugen deshalb Audit-Einträge, und abgeschlossene Buchungsperioden können gesperrt werden. Damit soll die Entstehung des Kontostands nachvollziehbar bleiben, statt durch die nächste Änderung stillschweigend überschrieben zu werden.

### Irgendwann braucht man trotzdem einen Beleg

Zurück zu den 40 Euro. Wir können den Betrag jetzt korrekt speichern, einer ausgeglichenen Buchung zuordnen und kontrollieren, wer sie bearbeiten darf.

Wenn das Komitee Deko gekauft hat, sollte aber immer noch jemand zeigen können, *welche* Deko. Sonst ist die Software lediglich sehr gut darin, unbelegte Behauptungen zu dokumentieren.

AbiVault unterstützt Fotos und PDFs von Belegen, Prüfstatus, Kassenbestände, Sparziele und CSV-Berichte. Belege liegen in privatem Storage und sind über kurzzeitig gültige signierte Links statt öffentlicher Datei-URLs erreichbar.

Die Oberfläche ist auf Deutsch, weil sie sich an deutsche Abikomitees richtet. Es gibt Layouts für Desktop, Tablet und Smartphone. Denn die Leute, die sich um das Geld kümmern, sitzen nicht immer vor einem Rechner.

{{figure:1}}

Auf dem Screenshot ist das **Demo-Dashboard** mit vorbereiteten Beispieldaten zu sehen. Es zeigt, wie die Oberfläche funktioniert und wie die Buchungen dargestellt werden. Das sind keine echten Finanzen eines Abschlussjahrgangs.

Die Unterscheidung ist wichtig. Ein Dashboard, das aussieht, als würde es funktionieren, ist noch kein Finanzsystem, das sich im Alltag einer Organisation bewährt hat.

### Eine Demo ist kein Security-Audit

Das Projekt enthält Unit-Tests und einen separaten SQL-Test für die Row-Level-Security-Regeln. Gerade wenn Organisationsgrenzen und Berechtigungen zum Konzept gehören, sind solche Tests wichtig.

Tests in einem Repository ersetzen aber keine unabhängige Sicherheitsprüfung. Ich habe AbiVault weder mit echtem Geld eines Abikomitees erprobt noch alle betrieblichen Voraussetzungen geschaffen, die ich für einen solchen Einsatz verlangen würde.

Auch eine Bankanbindung oder Open Banking gibt es nicht. Bevor das Projekt über eine kontrollierte Demo hinausgeht, würde ich mich unter anderem um bessere Backup- und Wiederherstellungsverfahren, Threat Modeling, eine unabhängige Prüfung und Usability-Tests mit Abikomitees kümmern.

Ich behaupte also nicht, dass AbiVault das Vertrauensproblem gelöst hätte. Das kann Software allein nicht.

Ich wollte ein System, in dem sich die Antwort auf „Wo sind die 40 Euro hin?“ aus nachvollziehbaren Informationen zusammensetzen lässt: einem exakten Betrag, einer Buchung, einer berechtigten Aktion, einer Änderungshistorie und einem Beleg.

Wenn ein Abschlussjahrgang dieser Spur folgen kann, ohne sich allein auf die Aussage einer Person verlassen zu müssen, erfüllt das Projekt seinen Zweck. Und vielleicht muss dann auch niemand aus einem Treffen des Abikomitees eine kleine Detektivermittlung machen, nur um herauszufinden, wo 40 Euro geblieben sind.

## In Zahlen

- Tech-Stack: Next.js 16, React 19, TypeScript, Clerk, Supabase/PostgreSQL
- Sicherheitsmodell: organisationsbezogene Row Level Security, Audit-Trigger, drei Rollen
- Geldbeträge: ganzzahlige Centbeträge mit bigint, ausgeglichene Buchungen
- Belege: privater Storage, signierte Links, PDF/JPG/PNG bis 5 MB
- Datenbankmigrationen: 19 im dokumentierten Projektstand
- Code: etwa 18.800 Zeilen TypeScript, 16.400 Zeilen CSS und 4.000 Zeilen SQL
- Dokumentierte Tests: 16 Vitest-Dateien, etwa 49 Tests und separater SQL-Test für RLS
- Demo: nur vorbereitete Beispieldaten, keine echten Finanzdaten
- Nicht implementiert: Bankanbindung / Open Banking

## Abbildungen

- ![Die Startseite von AbiVault stellt ein Notizbuch für die Klassenfinanzen vor und verlinkt zur Demo.](abivault/home.jpg) Die Startseite der Open-Source-Demo.
- ![Die Übersicht von AbiVault im hellen Design mit Beispielkontostand, letzten Buchungen, offenen Aufgaben und Sparzielen.](abivault/dashboard.jpg) Die lokal ausgeführte Open-Source-Demo mit Beispieldaten.

## Links

- [Quellcode-Repository: abi-vault](https://github.com/jeremy341/abi-vault)
- [Live-Demo](https://abi-vault-demo.vercel.app)
