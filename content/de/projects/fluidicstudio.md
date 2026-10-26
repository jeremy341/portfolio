# FluidicStudio

- Ursprüngliche Inhalts-ID: fluid
- Kategorie: Hardware & Embedded
- Status: Experimentelle Werkzeuge
- Technologien und Themen: Python, PyQt6, Hardwaresteuerung, Messungen

## Zusammenfassung

Eine Desktop-App, mit der sich ein Mikrofluidik-Labor aus einem Fenster steuern lässt: Pumpen, Durchflusssensor, Mikroskopkamera und Tröpfchenanalyse.

## Kontext und Motivation

FluidicStudio ist aus meinem Praktikum am Lehrstuhl für Elektronische Bauelemente und Schaltungen (EBS) an der Universität Duisburg-Essen entstanden, das vom 3. bis 28. August 2026 dauerte. Ich habe allein für Dr. Lin an einem System zur Steuerung und Bildanalyse für tröpfchenbasierte Mikrofluidik gearbeitet. Das Repository heißt Microdroplets UI, und FluidicStudio ist der Name der App darin.

Ich kam mit fast keinem Wissen über Mikrofluidik an, und der Plan war für vier Wochen ambitioniert. Die Idee war, die Bartels-Studio-Software abzulösen und den ganzen Ablauf an einem Ort zusammenzuführen, vom Betrieb der Pumpen bis zur Auswertung der Aufnahmen, mit Unterstützung für das Dino-Lite-Mikroskop. Dafür musste ich verschiedene Hard- und Softwareteile miteinander ins Gespräch bringen. Ich habe die Oberfläche gebaut, die den Aufbau steuert und die Ergebnisse zeigt, bei Versuchen mitgeholfen und Code geschrieben, der Tröpfchen in Kamerabildern findet und vermisst. Das Zeugnis listet diese Aufgaben, und die meisten davon sind in diesem Projekt gelandet. Als ich die Ergebnisse den Leuten am Lehrstuhl vorgestellt habe, waren sie begeistert.

Das Schwierige ist, was man misst. Die spannenden Ereignisse sind winzige Tröpfchen, die durch Kanäle wandern, die nur Bruchteile eines Millimeters breit sind. Ein Versuch heißt deshalb, Pumpen am Laufen zu halten, einen Durchflusssensor im Blick zu behalten, mit dem Mikroskop aufzunehmen und das Ergebnis danach aus dem Video abzulesen. Wenn man das über mehrere Programme und eine Tabelle macht, geht vieles langsam und einiges schief. Deshalb versucht FluidicStudio, alles aus einem Fenster zu erledigen und die Daten zusammenzuhalten.

## Im Projekt

FluidicStudio ist eine Desktop-Anwendung in Python mit PyQt6. Sie steuert den Versuchsaufbau von einer Stelle aus: Pumpen, einen Durchflusssensor, eine Mikroskopkamera und eine Offline-Analyse der aufgezeichneten Videos.

### Die Teile

- **Pumpen und Wellenformen.** Die App steuert Bartels-Mikropumpen über eine Treiberplatine mit mehreren Kanälen. Alle vier Kanäle teilen sich eine Treiberfrequenz, haben aber jeweils eigene Amplitude und Ein/Aus-Zustand. Jeder Kanal hat außerdem einen Besitzer, entweder die Handsteuerung oder eine laufende Wellenform. So können sich zwei Quellen nie um dieselbe Pumpe streiten. Die Wellenformen sind Sinus, Dreieck, Sägezahn und Rechteck.
- **Sensoren.** Messwerte eines Durchflusssensors von Sensirion (SLF3S-1300F) laufen über einen Protokoll-Parser in einen gemeinsamen Datenspeicher. Daraus versorgen sich die Live-Diagramme und ein CSV-Logger. Die Einheiten werden einmal an der Eingangsstelle umgerechnet, damit später niemand raten muss, was eine Zahl bedeutet.
- **Kamera.** Vorschau und Aufnahme von einem USB-Mikroskop laufen über OpenCV. Helligkeit, Belichtung und LED steuert man über die DNX64-Bibliothek des Herstellers. Die Aufnahme läuft in einem eigenen Worker. Wenn er hinterherhinkt, verwirft er alte Bilder, damit die Verzögerung zwischen Kamerabild und Anzeige begrenzt bleibt.
- **Tröpfchenanalyse.** Dieser Teil kommt aus der Bildanalyse im Praktikum. Die Analyse läuft in Schritten über ein aufgezeichnetes Video. Zuerst legt man eine Region of Interest fest und schätzt den Hintergrund. Dann findet die Analyse die Tröpfchen in jedem Bild, verfolgt sie, fügt die Spuren zusammen und zählt die Linienüberquerungen. Am Ende werden gemessen, kalibriert und als CSV mit Überlagerungen im Video exportiert. Der Code trennt ein gezähltes Ereignis von einer gültigen Messung, denn ein Tröpfchen kann die Linie überqueren und trotzdem zu unscharf sein, um es zu vermessen.
- **Arbeitsbereich.** Eine Ansicht mit zwei Feldern für schnelles Arbeiten. Sie liest denselben Backend-Zustand wie die vollen Seiten, damit die Logik nicht doppelt existiert und auseinanderlaufen kann.

### Wie es gebaut ist

Jede physische Platine bekommt ein eigenes Dienstebündel für Verbindung, Kanalbesitz, Pumpensteuerung und das Ausführen der Wellenformen. So können mehrere Platinen gleichzeitig angeschlossen sein.

Am meisten Sorgfalt hat das Herunterfahren gebraucht. Ein Code-Audit hat hier einen echten Fehler gefunden. Trennte sich die Platine im falschen Moment, konnte ein Einschaltbefehl für die Pumpe nach dem Stoppbefehl geschrieben werden, und die Pumpe lief dann ohne Kontrolle weiter. Die Lösung ist eine Sperre beim Abbau, die neue Befehle blockiert, sobald das Herunterfahren begonnen hat. Dazu kommt ein Regressionstest, damit der Fehler nicht unbemerkt zurückkommt.

## In Zahlen

- Code: etwa 23.700 Zeilen Python in App, Backend und Oberfläche und 7.600 Zeilen Tests
- Tests: 386 Testfunktionen in 50 Dateien; ich habe sie für diese Seite nicht erneut laufen lassen und behaupte deshalb nicht, dass alle bestehen
- Dokumentation: 39 Dateien, darunter zwei Code-Audits (das erste behob 30 Backend-Fehler)
- Geprüfte Kameravoreinstellungen für das Mikroskop: 1280 mal 1024 Pixel bei 10 oder 20 FPS und 640 mal 480 bei bis zu 30 FPS
- In der Software eingestellter Bereich des Pumpentreibers: 10 bis 250 Vss bei 50 bis 800 Hz für die Platine Highdriver4 (eine Softwaregrenze, kein Messergebnis)
- Benchmarks und Messgenauigkeit: keine

## Aktueller Stand

Das ist experimentelle Laborsoftware, und das Repository sagt das selbst. Es gibt keine Liste unterstützter Geräte, keine Messgenauigkeit, keine validierten Versuchsergebnisse und keine Aussage zur Produktionsreife. Die automatische Treibererkennung ist experimentell, die Seite für Ventile ist ein Platzhalter, und die Analyse funktioniert nur mit aufgezeichneten Videos, nicht mit einzelnen Bildern.

Softwaretests und Hardwarevalidierung sind aber zwei verschiedene Dinge. Für die meisten Bereiche gibt es einen Softwaretest, aber kein festgehaltenes Ergebnis vom Messplatz. Die Pumpenbereiche im Code sind deshalb Grenzen, die ich in der Software gesetzt habe, und keine Werte, die ich an der Hardware gemessen habe.

Bricht die serielle Verbindung ab, weiß die Software nicht mehr, was die Pumpen tun. Ihr physischer Zustand ist dann unbekannt, bis jemand nachsieht. Die DNX64-Bibliothek des Kameraherstellers ist proprietär und nicht im Repository enthalten. Einen Screenshot der Anwendung habe ich außerdem noch nicht veröffentlicht.

## Links

- [Quellcode-Repository: microdroplets-ui](https://github.com/jeremy341/microdroplets-ui)
