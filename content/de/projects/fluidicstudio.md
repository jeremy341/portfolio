# FluidicStudio

- Ursprüngliche Inhalts-ID: fluid
- Kategorie: Hardware & Embedded
- Status: Experimentelle Werkzeuge
- Technologien und Themen: Python, PyQt6, Hardwaresteuerung, Messungen

## Zusammenfassung

Meine Python-Desktop-App aus dem UDE-Praktikum vereint Pumpensteuerung, Durchflusssensoren, Mikroskopkamera und Tröpfchenanalyse.

## Story

**Mein Beitrag:** Ich habe die PyQt6-Desktop-App und die serielle Befehlsschicht gebaut und Pumpensteuerung, Durchflusssensoren, Mikroskopvideo und Tropfenanalyse zusammengeführt. [Quellcode: microdroplets-ui](https://github.com/jeremy341/microdroplets-ui)

Als ich mein Praktikum an der Universität Duisburg-Essen anfing, hatte ich von Mikrofluidik so gut wie keine Ahnung. Die Geräte konnten winzige Flüssigkeitsmengen steuern, den Durchfluss messen und Tröpfchen aufnehmen, die sich durch kleine Kanäle bewegen. Meine Aufgabe war es, die einzelnen Komponenten in einer benutzbaren Desktop-App zusammenzubringen.

Klang nach einem Softwareprojekt. War es technisch gesehen auch. Nur habe ich bei der Arbeit mit der Hardware gemerkt, dass einen Button mit der Aufschrift „Start pump“ zu zeichnen der einfachste Teil war.

Schwierig war die Frage, was *nach* dem Klick passiert.

In vier Wochen entstand meine App **FluidicStudio**, veröffentlicht im Repository Microdroplets UI. Sie ist ein eigenständiges Projekt aus der Arbeit an der Universität und nicht das Produkt des Herstellers, das zufälligerweise ebenfalls *Bartels FluidicStudio* heißt. Unglückliche Namenswahl, aber immerhin wissen wir jetzt, worüber ich spreche.

### Die Sprache des Boards

Der Aufbau bestand aus einem [Bartels mp-Multiboard2](https://bartels-mikrotechnik.de/product/mp-multiboard2-en/), einem mp-Highdriver4, Durchflusssensoren und einem Dino-Lite-Mikroskop. Statt einer fertigen Python-API für den gesamten Aufbau kommuniziert das Board über eine serielle USB-Schnittstelle. Man schickt kurze Zeichenfolgen an die Firmware und versucht, mit den Antworten etwas anzufangen.

Die grundlegenden Befehle dokumentiert Bartels bereits im [Softwarehandbuch](https://bartels-mikrotechnik.de/wp-content/uploads/2025/03/software-manual.pdf). Ich habe also kein geheimes Protokoll entschlüsselt. Die Arbeit bestand darin, die Dokumentation mit den tatsächlichen Firmware-Antworten und den angeschlossenen Treibern und Sensoren in Einklang zu bringen.

Einige der wichtigsten Befehle sehen dabei geradezu verdächtig einfach aus:

```text title=board-commands.txt
V        Firmware-Version abfragen
F0=100   Frequenz der ersten Treibergruppe einstellen
P1V120   Amplitude von Pumpe 1 auf 120 Vpp setzen
P1ON     Pumpe 1 einschalten
P1OFF    Pumpe 1 ausschalten
POFF     Abschaltung aller Pumpen anfordern
```

Das sind Beispiele für das Protokoll, keine Aufforderung, sie an unbekannte Hardware zu schicken. Der Aufbau kommuniziert mit 115200 Baud, 8N1 und CRLF als Zeilenende. Welche Werte sicher sind, hängt vom angeschlossenen Gerät ab.

Einfache Befehle, oder? Nur ist ein Befehl erst die Hälfte des Gesprächs. Ich musste noch herausfinden, welche eingehenden Zeilen Bestätigungen waren, welche Sensormessungen enthielten und wie ich die Firmware erkennen konnte, ohne versehentlich eine Einstellung zu ändern.

Und sobald mehrere Teile der App Befehle schickten, reichte es nicht mehr, zu wissen, was `P1ON` bedeutet.

### Ein Board, viele Steuerungen

Die App sollte manuelle Pumpensteuerung, Wellenformen, Sensordiagramme, Kameravorschau und einen Workspace mit zwei Ansichten bieten. Wenn alles dieselbe Hardware benutzt, können sich diese Funktionen nicht wie voneinander unabhängige Skripte verhalten.

Angenommen, auf einem Kanal läuft gerade eine Wellenform, während über die manuelle Steuerung dieselbe Pumpe geändert werden soll. Wer darf den nächsten Befehl schreiben? Wenn es beide tun, kann die UI etwas anderes anzeigen als das, was beim Board ankommt.

Daraus entstand eine klare Zuständigkeit pro Kanal: Zu einem bestimmten Zeitpunkt gehört er entweder der manuellen Steuerung oder dem Waveform-Controller. Das Backend unterscheidet außerdem zwischen Einstellungen für eine einzelne Pumpe und solchen, die für eine ganze Treibergruppe gelten.

Ich habe die Arbeit in den [Notizen zur Board-Kommunikation](https://github.com/jeremy341/microdroplets-ui/blob/main/docs/BOARD_COMMUNICATION.md) und zur [Pumpensteuerung](https://github.com/jeremy341/microdroplets-ui/blob/main/docs/BARTELS_PUMP_CONTROL_RESEARCH.md) festgehalten. Dokumentierte Befehle und während der Integration beobachtetes Verhalten sind dort getrennt.

Die kurzen Befehle fand ich am Anfang fast ein bisschen lustig. Wie sie koordiniert werden, stellte sich aber als wesentlich wichtiger heraus als ihre Länge.

Und dann fiel bei einem Code-Audit ein Fall auf, bei dem es darauf ganz besonders ankam.

### „Aus“ wird „an“

Stell dir vor, die App startet eine Pumpe. Das ist nicht unbedingt ein einzelner Schreibvorgang. Die Startsequenz kann erst eine Frequenz, dann eine Wellenform und die Amplitude setzen und schließlich die Pumpe aktivieren.

Jetzt stell dir vor, du klickst auf „Disconnect“, während diese Sequenz noch läuft.

Eigentlich erwartet man, dass der abschließende Befehl zum Ausschalten aller Pumpen Vorrang hat. Wozu sonst ein Disconnect-Button, wenn ein älterer Befehl die Pumpe hinterher wieder einschalten kann?

Ein ausführbares Regressionsszenario zeichnete **vor der Korrektur** diese Reihenfolge auf:

```text title=shutdown-trace.txt
0.001 s   F0=100
0.007 s   CS0=0
0.012 s   P1V120
0.613 s   POFF
0.618 s   P1ON    <- nach dem globalen Off-Befehl gesendet
```

Schau dir die letzten beiden Zeilen an. Bei 0,613 Sekunden wurde `POFF` gesendet. Fünf Millisekunden später schickte der noch ausstehende Startvorgang trotzdem `P1ON`.

Die App konnte also davon ausgehen, dass alles abgeschaltet war, während sie gerade selbst einen Befehl zum Einschalten einer Pumpe schickte. Bei physischer Hardware ist das mehr als ein nerviger UI-Bug.

Die Korrektur ergänzte den Serial Manager um eine **Sperre während des Shutdowns**. Sobald das Herunterfahren beginnt, werden keine neuen Befehle angenommen. Ausstehende Schreibvorgänge werden mit dem abschließenden Off-Befehl koordiniert. Ein Regressionstest prüft, dass das verspätete `P1ON` über die simulierte serielle Verbindung nicht mehr gesendet wird.

Das beweist nicht, dass sich jede reale Pumpe immer sicher abschaltet. Fällt die Verbindung aus oder fehlt die Bestätigung für den Off-Befehl, kann der Zustand der Hardware weiterhin unbekannt sein. Die Software muss diese Unsicherheit anzeigen, statt das Schließen eines Fensters als Nachweis einer erfolgreichen Abschaltung zu behandeln.

### Brauchbare Messwerte

Nachdem Steuerung und Abschaltung klarer definiert waren, mussten die Messwerte an verschiedenen Stellen der App übereinstimmen.

Ein gemeinsames Sensor-Backend versorgt Live-Diagramme und CSV-Aufzeichnung, damit unterschiedliche Ansichten dieselben Werte nicht unterschiedlich interpretieren. Rohe Durchflussmesswerte müssen beispielsweise konsistent in Mikroliter pro Minute umgerechnet werden. Lieber mache ich das einmal im Datenpfad, als jedes Widget seine eigene Umrechnung erfinden zu lassen.

Bei der Kamera kommt ein anderer Kompromiss dazu: eine flüssige Live-Vorschau und die Aufzeichnung jedes einzelnen Frames sind nicht dieselbe Aufgabe. Wenn die Verarbeitung nicht hinterherkommt, kann ein Puffer aus dem vermeintlichen Live-Bild eine zeitversetzte Ansicht des Experiments machen.

Und dann die Tröpfchenanalyse: Die App muss einen Bildbereich auswählen, den Hintergrund abschätzen, Objekte erkennen, Erkennungen über mehrere Frames zuordnen, Überquerungen zählen und entscheiden, welche Messungen tatsächlich gültig sind.

```flow
Mikroskopvideo
Bildbereich wählen und Hintergrund schätzen
Tröpfchen erkennen
Tracking über mehrere Frames
Überquerungen erkennen und Messwerte validieren
CSV und annotiertes Video exportieren
```

Das Diagramm zeigt den Ablauf, keine Garantie für Messgenauigkeit. Eine Überquerung kann gezählt werden, obwohl unscharfe Frames oder ein unterbrochener Track die Schätzung von Länge oder Geschwindigkeit unzuverlässig machen. Ein Ereignis zu erkennen ist eben etwas anderes, als eine Messung zu validieren.

### Vier Wochen, kein Messgerät

Das Praktikum lief vom 3. bis zum 28. August 2026. Herausgekommen sind eine umfangreiche PyQt6-App, eine dokumentierte Kommunikationsschicht und mehrere integrierte Arbeitsabläufe. Es gibt aber Grenzen, die ich nicht unter den Tisch fallen lassen möchte.

Die Ventilseite ist noch nicht fertig. Die Treibererkennung funktioniert nicht in jeder Konfiguration zuverlässig, und Teile der Analyse hängen von aufgezeichneten Videos oder proprietären Dino-Lite-Komponenten ab. Das Repository enthält Tests und Code-Audits. **Softwaretests sind aber kein physischer Kalibriernachweis.** Einen veröffentlichten Genauigkeits-Benchmark für die Tröpfchenmessung habe ich nicht.

Wenn ich das Projekt weiterentwickle, möchte ich die physischen Messungen reproduzierbarer machen und noch deutlicher zwischen angeforderten Aktionen der UI und bestätigten Zuständen der Hardware unterscheiden.

Am Anfang dachte ich, ich müsste lediglich mehrere Geräte in einer Oberfläche zusammenbringen. Es brauchte eine unterbrochene Verbindung, ein paar verblüffend kurze serielle Befehle und eine wirklich ungünstige Reihenfolge beim Shutdown, bis ich verstand, was da alles dranhängt.

Einen Disconnect-Button zu zeichnen ist einfach. Dafür zu sorgen, dass man ihm vertrauen kann, ist das eigentliche Engineering-Problem.

## In Zahlen

- Praktikum: 3.–28. August 2026, Universität Duisburg-Essen
- Implementierung: Python mit PyQt6, serielle Kommunikation, OpenCV und gemeinsames Sensor-Backend
- Hardware: Bartels mp-Multiboard2, mp-Highdriver4, Sensirion SLF3S-1300F und Dino-Lite-Mikroskop
- Code: etwa 23.700 Zeilen Python und 7.600 Zeilen Tests im dokumentierten Stand
- Dokumentierte Tests: 386 Funktionen in 50 Dateien; für diese Seite nicht alle unabhängig erneut ausgeführt
- Serielles Herstellerprotokoll: 115200 Baud, 8N1, CRLF
- Dokumentierte Kameramodi: 1280×1024 bei 10 oder 20 FPS; 640×480 bei bis zu 30 FPS
- Softwaregrenzen der Pumpensteuerung: 10–250 Vpp und 50–800 Hz beim Highdriver4, keine gemessene Leistung
- Verifizierte Genauigkeit der Labormessungen: öffentlich nicht nachgewiesen

## Links

- [Quellcode-Repository: microdroplets-ui](https://github.com/jeremy341/microdroplets-ui)
- [Notizen zur Board-Kommunikation](https://github.com/jeremy341/microdroplets-ui/blob/main/docs/BOARD_COMMUNICATION.md)
- [Untersuchung zur Pumpensteuerung](https://github.com/jeremy341/microdroplets-ui/blob/main/docs/BARTELS_PUMP_CONTROL_RESEARCH.md)
- [Softwarehandbuch von Bartels](https://bartels-mikrotechnik.de/wp-content/uploads/2025/03/software-manual.pdf)
