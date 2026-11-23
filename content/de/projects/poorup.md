# Poorup

- Ursprüngliche Inhalts-ID: poorup
- Kategorie: Spiele & Software
- Status: Spielbares Projekt
- Technologien und Themen: Node.js, Express, Socket.IO, JavaScript

## Zusammenfassung

Ein Multiplayer-Brettspiel im Browser: kaufen, handeln, bauen und Freunde in den Bankrott treiben. Spannend wurde es beim gemeinsamen Spielzustand.

## Story

Eigentlich wollte ich ein Spiel bauen, das ich mit meinen Freunden spielen kann. Daraus wurde Poorup, ein Immobilien-Brettspiel im Browser, in dem man Grundstücke kaufen, handeln, beleihen und sich gegenseitig in den Bankrott treiben kann. Irgendwie fanden auch Auktionen, Bots, eine fiktive Börse und ein paar weitere Systeme ihren Weg ins Spiel.

Aus Spielersicht sind die Regeln recht einfach: einem Raum beitreten, würfeln und möglichst nicht pleitegehen.

Damit überspringt man aber den interessantesten Teil. Wenn mehrere Leute auf verschiedenen Geräten spielen, wer entscheidet eigentlich, was passiert ist? Wenn sich zwei Browser nicht darüber einig sind, wer ein Grundstück gekauft hat, reicht es nicht, dass beide Oberflächen überzeugend aussehen.

Auktionen haben sich als besonders gute Möglichkeit erwiesen, dieses Problem sichtbar zu machen.

{{figure:0}}

### Ein gemeinsamer Spielstand

Ein Spieler kann auf einen Button klicken, um zu bieten oder etwas zu kaufen. Aber sein Browser soll nicht die letzte Entscheidung treffen. Er schickt eine **Aktionsanfrage** an den Node.js-Server. Der prüft, wer am Zug ist, wie viel Geld zur Verfügung steht und was die Regeln erlauben, bevor er den gemeinsamen Spielzustand ändert.

[Socket.IO](https://socket.io/) kümmert sich um die Echtzeitkommunikation zwischen Clients und Server. Das vereinfacht den Nachrichtenaustausch, heißt aber nicht, dass jede Nachricht sofort ankommt oder alle sie gleichzeitig sehen.

Stell dir vor, jemand klickt auf „Buy“, während der Bildschirm eines anderen Spielers noch einen älteren Spielstand zeigt. Wenn beide Browser selbst entscheiden dürften, könnte dasselbe Grundstück plötzlich zwei verschiedene Eigentümer haben.

Für ein Immobilien-Brettspiel wäre das ein ziemlich schlechtes Feature.

Der Server ist deshalb **autoritativ**: Er prüft die Aktion, aktualisiert den Raum und verteilt das Ergebnis. Damit lassen sich viele Inkonsistenzen auf Client-Seite vermeiden. Gegen jeden denkbaren Exploit ist das Spiel dadurch natürlich noch nicht geschützt.

{{figure:1}}

Ein Grundstück zu kaufen ist aber nur eine einzelne Aktion. Bei Auktionen kommen mehrere Spieler, sich ständig ändernde Gebote und eine Deadline zusammen, auf die alle schauen. Und plötzlich wird aus einem harmlosen Countdown ein Engineering-Problem.

### Nicht der Countdown

Was passiert, wenn auf meinem Handy noch 80 Millisekunden übrig sind, auf deinem Laptop 140 und wir beide auf „Bid“ drücken? Gemessen an ihren eigenen Uhren könnten beide Geräte recht haben. Trotzdem kann es nur ein gemeinsames Ergebnis geben.

Naheliegend wäre es, jeden Browser selbst entscheiden zu lassen, ob sein Gebot rechtzeitig kam. Nur gehen Browseruhren nicht immer gleich, Nachrichten können sich verspäten und dem Code im Browser eines Clients sollte der Server nicht blind vertrauen.

Die Auktionsfrist liegt deshalb beim **Server**. In der aktuellen Implementierung dauert sie fünf Sekunden. Gebote, die ab Erreichen der Deadline eintreffen, werden abgelehnt; akzeptierte Gebote verlängern die Frist. Außerdem gibt es zwischen Geboten einen Cooldown von 300 ms.

Damit ist geklärt, *wer entscheidet*. Die UI muss aber weiterhin etwas Sinnvolles anzeigen, während Nachrichten zwischen Browser und Server unterwegs sind.

Der Client verwendet einen Zeitversatz aus dem synchronisierten Spielzustand, damit der Countdown näher an der Serverzeit liegt. Der relevante Ausschnitt aus `clientAuctionUi.js`:

```js title=clientAuctionUi.js
function serverNow() {
  return Date.now() + (state.serverTimeOffset || 0);
}

const remaining = a.deadline - serverNow();
```

Die Berechnung sorgt für eine konsistentere Anzeige. Sie gibt dem Browser keine Entscheidungsgewalt. Kommt ein Gebot zu spät beim Server an, hilft es auch nicht, wenn der Countdown auf dem Bildschirm noch einen Sekundenbruchteil zeigt.

Super, die Uhr gehört also dem Server. Problem gelöst?

Bis jemand die Verbindung verliert.

### Verbindungsabbruch

Ich erinnere mich besonders an eine unangenehme Situation: Jemand verlässt den Raum mitten in einer Auktion. Der Server kann nicht mehr voraussetzen, dass alle Teilnehmer verbunden sind. Er kann aber auch nicht einfach so tun, als wäre ein Verbindungsabbruch eine bewusste Entscheidung gewesen, nicht weiterzubieten.

Der Code unterscheidet deshalb zwischen getrennten Teilnehmern und aktiven Bietern. Er prüft die Berechtigung sowohl beim Eingang eines Gebots als auch bei der Ermittlung des Gewinners. Verlässt der Spieler, der die Auktion gestartet hat, während des betreffenden Zugs den Raum, gibt es außerdem einen Pfad, um die Auktion abzubrechen.

Und selbst wenn die Verbindungsabbrüche behandelt werden, bleibt die nächste Frage: Was passiert mit dem Geld hinter dem Höchstgebot?

Wenn ich mit einem Gebot von 500 $ führe, sollte ich dieselben 500 $ nicht gleichzeitig für etwas anderes ausgeben können und trotzdem erwarten, die Auktion zu gewinnen. Der Server berücksichtigt deshalb das Geld, das durch mein Höchstgebot gebunden ist, wenn er prüft, was ich ausgeben darf.

Deshalb ging es beim Timer im Grunde nie darum, fünf Sekunden auf einem Bildschirm darzustellen. Es ging darum, was das Spiel tun soll, wenn zwei Nachrichten fast gleichzeitig ankommen, ein Spieler verschwindet oder der angezeigte Kontostand nicht mehr dem tatsächlich verfügbaren Geld entspricht.

Die UI muss diese Entscheidungen übernehmen und sich wieder synchronisieren, wenn ihre lokale Ansicht veraltet ist. Sie kann nicht darauf bestehen, dass der optimistisch angezeigte Zustand von eben schon stimmen muss.

### Dann kamen mehr Dinge

Als die Multiplayer-Aktionen funktionierten, blieb viel Platz für Experimente. Poorup hat inzwischen die Bretter Standard-40 und Metro-52, öffentliche und private Räume, einen Gastmodus, Handel, Immobilienentwicklung, Finanzierung und fiktive Marktereignisse.

Ich habe außerdem die Oberfläche und die SVG-Grafiken gestaltet und mehrere Themes entwickelt. Offenbar waren all die Spielregeln noch nicht genug. Das Spielbrett sollte auch je nach Stimmung anders aussehen.

{{figure:2}}

Mit den Bots kam ein weiteres Zuverlässigkeitsproblem dazu. Es gibt deterministische Bot-Logik und einen KI-Beratermodus, mit einem Fallback, falls der externe KI-Anbieter nicht verfügbar ist. Ein Multiplayer-Spiel sollte nicht stehen bleiben, nur weil irgendein anderer Dienst nicht antwortet.

GPT/Codex habe ich auch beim Debugging und bei der Implementierung eingesetzt, insbesondere beim Bot-Verhalten und bei größeren Backend-Refactorings nach Code-Reviews. Die UI und die SVG-Grafiken stammen von mir. Mir ist lieber, ich erkläre, wobei ich Unterstützung hatte, als so zu tun, als wäre jede einzelne Zeile ohne sie entstanden.

Alle zusätzlichen Features müssen mit demselben Spielzustand arbeiten. Eine schöne neue Auktionsanimation bringt nichts, wenn sie die Regeln durcheinanderbringt, nach denen alle anderen spielen.

### Noch nicht fertig

Mehr Code bedeutet auch mehr Gelegenheiten, dass irgendetwas schiefgeht.

Der Server speichert Accounts und Spielverläufe momentan in JSON-Dateien. Für das Deployment mit einem einzelnen Serverprozess ist das überschaubar, mehrere Instanzen gleichzeitig zu betreiben wäre dagegen deutlich komplizierter. Ohne geeigneten Storage-Adapter verhindert die Anwendung so einen Aufbau.

Auch einen festen Timer für jeden Zug gibt es nicht. Stattdessen arbeitet das Spiel mit Inaktivitätserkennung und Abstimmungen, um Spieler aus dem Raum zu entfernen. Einzelne Features müssen noch überprüft werden, darunter Unterschiede zwischen Versionen der Parlor-Patrol-Dokumentation und dem veröffentlichten Spiel.

Es gibt automatisierte Tests. Aber manchmal besteht ein ziemlich guter Test auch einfach darin, zwei Leute in denselben Raum zu setzen, zu beobachten, was bei schlechten Verbindungen passiert, und zu prüfen, ob der Server trotzdem ein einheitliches Ergebnis liefert.

{{figure:3}}

Ich habe Poorup angefangen, weil ein Immobilien-Brettspiel mit Freunden Spaß machen sollte. Nicht erwartet hatte ich, wie viel der Arbeit sich um Uhren, Reihenfolgen, Konsistenz und Menschen drehen würde, die mitten in einer Entscheidung verschwinden.

Andererseits: Wenn ich schon Leute ihre Freunde online in den Bankrott treiben lasse, sollten wir uns wenigstens darüber einig sein, wer die Auktion gewonnen hat.

## In Zahlen

- Spielbretter: 2, Standard-40 und Metro-52
- Themes: 6
- Erfolge: 48 im dokumentierten Projektstand
- Spielaktionen: 47 im zentralen Game-Socket-Modul
- Code: etwa 61.000 Zeilen JavaScript und 39.000 Zeilen Tests im dokumentierten Stand
- Tests: 229 Testsuiten im dokumentierten vollständigen Lauf; CI verlangt mindestens 88 % Zeilenabdeckung
- Laufzeitabhängigkeiten: Express und Socket.IO
- Architektur: einzelner Serverprozess mit JSON-Speicherung; keine allgemeine Unterstützung mehrerer Instanzen
- Auktionen: serverseitige Fünf-Sekunden-Frist, nach akzeptiertem Gebot neu gesetzt, mit 300 ms Cooldown

## Abbildungen

- ![Poorups Social Card: der Pixel-Art-Titel, die Zeile Roll. Buy. Trade. Bankrupt your friends. und eine schräge Ansicht des Spielbretts.](poorup/social-card.png) Die Social Card.
- ![Ein Poorup-Raum auf dem Standard-40-Brett. Links steht die Spielerliste, in der Mitte die Würfel und der Knopf Roll Dice, rechts die Tabs Holdings, Deals und Activity.](poorup/board.png) Ein Testtisch auf dem Brett mit 40 Feldern.
- ![Poorups Startbildschirm im Wintermotiv: ein Pixel-Art-Dorf unter einem Mond, mit den Knöpfen Play, Create Room und Join Room.](poorup/theme-winter.png) Der Startbildschirm im Wintermotiv.
- ![Eine Poorup-Profilseite auf dem Tab History, oben mit Spielen, Siegen und Siegquote und darunter eine Liste abgeschlossener Runden, eine davon aufgeklappt.](poorup/profile-history.png) Ein Profil mit Spielverlauf.

## Links

- [Quellcode-Repository: Poorup](https://github.com/jeremy341/Poorup)
- [Live-Demo: poorup.tech](https://poorup.tech)
