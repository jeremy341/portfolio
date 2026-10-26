# AbiVault

- Ursprüngliche Inhalts-ID: abi
- Kategorie: Spiele & Software
- Status: Privates Projekt
- Technologien und Themen: Next.js, TypeScript, Supabase

## Zusammenfassung

Ein gemeinsamer Geldbereich für Schulkomitees und kleine Teams, aufgebaut so, dass jeder Cent nachvollziehbar bleibt.

## Kontext und Motivation

In Deutschland verwaltet der Abschlussjahrgang (das „Abi“-Jahr) sein Geld selbst. Es geht um ein Jahrbuch, eine Fahrt, eine Feier, bezahlt aus Verkäufen und Mitgliedsbeiträgen. Meist führt das Komitee dafür eine gemeinsame Tabelle. Das funktioniert, bis jemand fragt, wohin genau 40 Euro gegangen sind.

AbiVault macht dieselbe Arbeit so, wie es die Buchhaltung macht. Einnahmen und Ausgaben werden als richtige Buchungen erfasst, Belege angehängt, Kassen gezählt, und jede Änderung hinterlässt eine Spur. Mitglieder sehen, wohin das Geld fließt, ohne es verändern zu können. Genau das kann eine Tabelle schlecht.

## Im Projekt

AbiVault ersetzt die Tabelle des Komitees durch eine Anwendung, die mit Geld sorgfältig umgeht. Daraus folgt das wichtigste Designziel: Die Bücher dürfen nie falsch sein, auch wenn jemand einen Fehler macht.

### Wie es funktioniert

- Geld wird als ganze Cent gespeichert (EUR-Untereinheiten in einem `bigint`), nie als Gleitkommazahl. So können sich keine Rundungsfehler einschleichen.
- Eine Buchung läuft über eine Datenbankfunktion, die ausgeglichene Einträge im Hauptbuch schreibt. Deshalb gehen die Bücher immer auf.
- Jede Zeile gehört zu einer Organisation aus dem Anmelde-Token, und Row Level Security in PostgreSQL setzt das durch. Audit-Trigger halten wichtige Änderungen fest, und ein abgeschlossener Buchungszeitraum lässt sich sperren.
- Drei Rollen: Admin, Aufsicht und Schüler. Schüler sehen eine eingeschränkte Ansicht, die zeigt, wohin das Geld geht, ohne dass sie etwas ändern können.
- Belege (PDF, JPG oder PNG, bis 5 MB) landen in einem privaten Speicher. Man öffnet sie über kurzlebige signierte Links, und jeder Beleg hat einen Prüfstatus, damit jemand ihn kontrollieren kann.
- Kassen mit Kassenzählungen, Sparziele, Berichte mit CSV-Export und Einladungslinks für neue Mitglieder.
- Drei getrennte Layouts für Desktop, Tablet und Handy, statt ein einziges Layout auf jeden Bildschirm zu quetschen. Die Oberfläche ist auf Deutsch, weil die Leute, die sie benutzen, Deutsch sprechen.

### Der Stack

Next.js 16 mit App Router und Server Actions, React 19 und TypeScript. Clerk übernimmt Anmeldung und Organisationen, und Supabase liefert PostgreSQL, Row Level Security und Dateispeicher. Zod prüft Eingaben, Recharts zeichnet die Berichte und Tailwind 4 übernimmt das Styling. Vitest führt die Unit-Tests aus. Die Row-Level-Security-Regeln bekommen aber einen eigenen SQL-Test, weil genau dort am wenigsten Fehler passieren sollten.

## In Zahlen

- Code: etwa 18.800 Zeilen TypeScript, 16.400 Zeilen CSS und 4.000 Zeilen SQL in meiner Arbeitskopie
- Datenbank: 19 Migrationen
- Tests: 16 Vitest-Dateien mit etwa 49 Testfällen und ein SQL-Test mit 306 Zeilen für Row Level Security; ich habe sie für diese Seite nicht erneut laufen lassen
- Rollen: 3, und Belege bis 5 MB in 3 Dateitypen
- Nicht gebaut: Bankanbindungen

## Abbildungen

- ![Die Übersichtsseite von AbiVault im dunklen Modus: Kennzahlen, eine Kassenkarte, die letzte Buchung, ein Zielbereich und ein Beleg, der auf Prüfung wartet.](abivault/dashboard.png) Die öffentliche Demo mit Beispieldaten. Manche Stellen zeigen noch den alten Namen Abi Manager.

## Aktueller Stand

Bankanbindungen und Open Banking sind zurückgestellt und abgeschaltet. Die öffentliche Demo läuft mit erfundenen Beispieldaten in einer getrennten Konfiguration und ist deshalb nicht für echte Finanzdaten gedacht. Sie basiert auf einem älteren Entwicklungszweig. Meine Arbeitskopie wurde seitdem überarbeitet, aber einige Teile der Oberfläche sagen noch Abi Manager, weil die erste Version einen anderen Namen trug.

## Links

- [Quellcode-Repository: abi-vault](https://github.com/jeremy341/abi-vault)
- [Live-Demo](https://abi-vault-demo.vercel.app)
