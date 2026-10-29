# Poorup

- Ursprüngliche Inhalts-ID: poorup
- Kategorie: Spiele & Software
- Status: Spielbares Projekt
- Technologien und Themen: Node.js, Express, Socket.IO, JavaScript

## Zusammenfassung

Ein Multiplayer-Brettspiel, das im Browser läuft. Alle sehen denselben Spielstand, Züge können überraschen, und ein bisschen freundlicher Wettbewerb gehört auch dazu.

## Kontext und Motivation

Ich habe Poorup angefangen, weil ich lernen wollte, wie Echtzeit-Webanwendungen funktionieren und wie man Spiellogik auf dem Server schreibt. Die meisten meiner Projekte haben in der Hack-Club-Community angefangen, und dieses auch. Außerdem wollte ich etwas, das meine Freunde und ich wirklich zusammen spielen können. Als es draußen war, haben die Leute es geliebt.

Es ist ein Spiel im Stil von Monopoly. Man würfelt, kauft, handelt und versucht, als Letzter noch Miete zahlen zu können. Man muss nichts herunterladen und braucht kein Konto. Man öffnet einen Link, wählt einen Namen und teilt den Raumcode mit allen, die am Tisch sitzen sollen.

Die schwierigen Teile merkt man aber meist erst, wenn sie kaputtgehen. Was passiert, wenn jemand mitten in einer Auktion die Verbindung verliert? Was, wenn zwei Spieler in derselben Sekunde dasselbe Grundstück kaufen wollen? Was, wenn ein Spieler einfach geht? Mit diesen Fragen habe ich mich am meisten beschäftigt, und dabei habe ich das Meiste gelernt, was ich aus diesem Projekt mitgenommen habe.

## Im Projekt

Der Server besitzt das Spiel. Der Browser schickt nur, was der Spieler tun will, also würfeln, kaufen, bieten oder einen Handel annehmen, über [Socket.IO](https://socket.io/). Der Server prüft jede Aktion gegen die Regeln und schickt den neuen Zustand zurück. Deshalb kann ein manipulierter Browser nicht schummeln, denn er entscheidet nichts. Der Server läuft mit Node.js und Express. Der Client ist einfaches HTML, CSS und JavaScript ohne Framework, sodass die einzigen Laufzeitabhängigkeiten `express` und `socket.io` sind.

### Was im Spiel steckt

- Es gibt zwei Spielbretter, Standard-40 und Metro-52. Beide sind als Daten beschrieben und nicht als zwei getrennte Regelwerke.
- Räume gibt es öffentlich oder privat mit Code. Dazu kommen Gasteinstieg, Chat, Wiederverbinden nach einem Abbruch, das Entfernen inaktiver Spieler und ein Rauswurf per Abstimmung.
- Beim Grundstücksspiel geht es um Kaufen, Miete kassieren, gleichmäßiges Bauen innerhalb einer Farbgruppe, Beleihen, Versteigern und Handeln.
- Geld zwischen Spielern geht über die Grundlagen hinaus: Handels- und Finanzierungsangebote auch außerhalb des eigenen Zugs, Bankkredite und Kredite zwischen Spielern mit Sicherheiten und festen Regeln für den Ausfall. Dazu kommen gesponserte Käufe, bei denen ein Spieler das Grundstück eines anderen gegen einen vereinbarten Anteil bezahlt.
- Es gibt eine optionale Börse in Spielgeld mit gemeinsamen Kursen. Globale Ereignisse bewegen den Markt und können sogar die Regeln für eine Runde ändern. Ein optionales Casino, ebenfalls in Spielgeld, ist auch dabei.
- Bots gibt es in zwei Modi. Der eine ist ein deterministischer Bot namens House Brain. Der andere ist ein KI-Berater, der nur Züge ordnet, die die Regel-Engine ohnehin für erlaubt hält. Fällt sein Anbieter aus oder braucht er länger als vier Sekunden, spielt House Brain den Zug stattdessen.
- Profile zeigen Spielverlauf, Erfolge, Freunde und Ranglisten.
- Sechs Themenwelten mit Pixel-Art-SVGs und ein optionaler Musikplayer.

### Hinter dem Bildschirm

Der Server ist nach Aufgaben aufgeteilt. Auktionen, Handel, Miete, Karten, Bankrott, Flughäfen, die Wirtschaft und gesponserte Käufe haben jeweils ein eigenes Modul. Die Regeln liegen in getrennten Dateien, damit eine Änderung an einer Regel nicht überall etwas anderes kaputt macht. Jedes Socket-Ereignis läuft durch eine Ratenbegrenzung und eine Liste erlaubter Herkunftsadressen, bevor überhaupt etwas passiert.

Es gibt keine Datenbank. Konten, Spiele und soziale Daten liegen als JSON-Dateien mit Sicherungskopien und Prüfsummen. Ein Health-Endpunkt und ein Drain-Modus machen es aber leichter, eine neue Version auszurollen, ohne laufende Spiele abzubrechen.

### Wie ich es gebaut habe

Die gesamte Oberfläche habe ich selbst entworfen und geschrieben, und alle SVG-Grafiken habe ich selbst gezeichnet. [GPT](https://openai.com/)/[Codex](https://openai.com/) hat beim Debuggen und beim Backend geholfen und den größten Teil der Bots im Spiel mitgebaut. Ein Code-Health-Werkzeug hat einige meiner größten Dateien als Problemstellen markiert, deshalb habe ich sie mit [Codex](https://openai.com/) in kleinere Module aufgeteilt.

Die Musik ist nicht von mir. Sie stammt von Dritten und ist offen lizenziert, die Nachweise stehen im Repository. Außerdem habe ich die Git-Historie absichtlich neu geschrieben, deshalb zeigt das Commit-Protokoll nicht die ganze Entwicklung.

## In Zahlen

- Spielbretter: 2, Standard-40 mit 40 Feldern und Metro-52 mit 52 Feldern
- Themen: 6, mit 12 offen lizenzierten Musikstücken
- Erfolge: 48
- Spielaktionen: 47 im Haupt-Socket-Modul des Spiels
- Code: etwa 61.000 Zeilen JavaScript in Server und Client (nur Dateien auf oberster Ebene) und etwa 39.000 Zeilen Tests
- Tests: 229 Testsuiten im vollen Lauf, und die CI lässt den Build unter 88 % Zeilenabdeckung scheitern
- Laufzeitabhängigkeiten: 2 (`express` und `socket.io`)
- Code-Health: Die durchschnittliche Quelldatei erreichte in einer CodeScene-Prüfung im Oktober 2026 9,2 von 10

## Abbildungen

- ![Poorups Social Card: der Pixel-Art-Titel, die Zeile Roll. Buy. Trade. Bankrupt your friends. und eine schräge Ansicht des Spielbretts.](poorup/social-card.png) Die Social Card.
- ![Ein Poorup-Raum auf dem Standard-40-Brett. Links steht die Spielerliste, in der Mitte die Würfel und der Knopf Roll Dice, rechts die Tabs Holdings, Deals und Activity.](poorup/board.png) Ein Testtisch auf dem Brett mit 40 Feldern.
- ![Poorups Startbildschirm im Wintermotiv: ein Pixel-Art-Dorf unter einem Mond, mit den Knöpfen Play, Create Room und Join Room.](poorup/theme-winter.png) Der Startbildschirm im Wintermotiv.
- ![Eine Poorup-Profilseite auf dem Tab History, oben mit Spielen, Siegen und Siegquote und darunter eine Liste abgeschlossener Runden, eine davon aufgeklappt.](poorup/profile-history.png) Ein Profil mit Spielverlauf.

## Aktueller Stand

Ein laufendes Spiel liegt im Arbeitsspeicher, und Konten, Spiele und soziale Daten sind JSON-Dateien. Ohne Datenbank läuft Poorup als einzelner Prozess und ist nicht darauf ausgelegt, auf mehrere Instanzen zu skalieren. Deshalb verweigert eine Sperre den Start in einem Setup mit mehreren Instanzen, bis es einen echten Datenbankadapter gibt.

Einiges ist noch rau. Das Minispiel Parlor Patrol ist abgeschaltet, weil es nicht zuverlässig funktioniert. Außerdem gibt es keine Zugzeit. Ein langsamer Spieler kann deshalb einen Tisch aufhalten, bis das Entfernen inaktiver Spieler oder ein Rauswurf per Abstimmung greift. Das Quellcode-Repository ist der beste Anhaltspunkt dafür, was heute funktioniert. Die Demo läuft separat, weshalb sie ab und zu nicht erreichbar sein kann.

## Links

- [Quellcode-Repository: Poorup](https://github.com/jeremy341/Poorup)
- [Live-Demo: poorup.tech](https://poorup.tech)
