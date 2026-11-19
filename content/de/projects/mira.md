# MIRA

- Ursprüngliche Inhalts-ID: mira
- Kategorie: Maschinelles Lernen
- Status: Experiment
- Technologien und Themen: Computer Vision, Python, YOLO, ONNX

## Zusammenfassung

Ich habe einer Kamera beigebracht, Müll zu erkennen – erst mit einem Klassifikator, dann mit YOLO. Warum ein guter Validierungswert nicht alles ist.

## Story

Ich weiß noch, wie ich bei der Validierung von MIRA die **90,6 % mAP50** gesehen habe. Nach all den Trainingsläufen, Änderungen am Datensatz und Ideen, die nicht funktioniert hatten, stand da endlich eine Zahl, bei der sich die ganze Arbeit gelohnt zu haben schien.

Dachte ich zumindest.

Als ich anfing, die Modelle unter weniger kontrollierten Bedingungen zu testen, war ich mir da plötzlich nicht mehr so sicher. In meinen eigenen Praxistests wirkte das neuere Modell nicht durchgehend so zuverlässig wie EXP-014, ein älterer Versuch mit deutlich weniger beeindruckendem Validierungswert.

Wie kann ein Modell auf dem Papier *besser* werden und mich im Einsatz trotzdem weniger überzeugen? Genau diese Frage hat die nächsten Schritte bei MIRA bestimmt.

### Vom Bild zum einzelnen Objekt

MIRA steht für **Machine Intelligence for Recycling Automation**. Langfristig möchte ich mithilfe einer Kamera und eines kleinen Modells Müll sortieren. Bevor ich mir überhaupt Gedanken über eine Sortiermaschine machen konnte, musste ich allerdings herausfinden, ob die Software den Müll überhaupt erkennt.

Angefangen habe ich mit 796 Fotos in vier Klassen und einem kleinen Convolutional Neural Network (CNN). Später habe ich MobileNetV2 per Fine-Tuning angepasst. Der Klassifikator erreichte etwa 87 % Validierungsgenauigkeit; die exportierte INT8-TFLite-Version war 2,6 MB groß.

Ein guter Anfang. Stell dir aber vor, vor der Kamera liegen zwei Flaschen und ein Stück Papier. Ein Klassifikator kann dir sagen, welche Kategorie am besten zum *gesamten Bild* passt. Wo die einzelnen Gegenstände liegen, weißt du damit noch nicht. Dafür brauchte ich **Objekterkennung**: Das Modell bestimmt nicht nur die Klasse, sondern auch eine Bounding Box um den Gegenstand.

Also bin ich auf YOLOv8n und schließlich auf YOLO11n umgestiegen. Damit erkannte MIRA Glas, Metall, Papier, Plastik und die Klasse Trash. Das löste die Frage, welche Art von Problem mein Modell bearbeiten sollte. Nicht aber die wesentlich lästigere Frage, welchen Daten ich eigentlich trauen konnte.

### Der Datensatz war selbst Teil des Experiments

Meine Bilder kamen aus ganz unterschiedlichen Quellen: [TACO](https://tacodataset.org/), [TrashNet](https://github.com/garythung/trashnet), [Roboflow](https://roboflow.com/) und einem Datensatz von dmedhi. Auf manchen Bildern lagen einzelne Gegenstände vor sauberem Hintergrund, andere zeigten Müll mitten in unübersichtlichen Alltagssituationen.

Mehr Bilder schienen mir zunächst eine ziemlich naheliegende Verbesserung zu sein. Mehr Beispiele, mehr lernen, oder? Nur unterschieden sich die Quellen bei den Labels, der Verteilung der Klassen und den Aufnahmebedingungen. Mehr Daten sind eben nicht unbedingt *bessere* Daten.

Ich habe verschiedene Kombinationen getestet, WaRP wieder entfernt, nachdem sich die Ergebnisse verschlechtert hatten, und schließlich einen ausgewogenen Datensatz neu aufgebaut. Ein fester Zufalls-Seed und eine Deduplizierung mit SHA-256 sollten das Risiko senken, dieselben Dateien im Training und bei der Auswertung zu verwenden. Am Ende waren es **6.898 Bilder und 12.832 Bounding Boxes**: 5.108 Trainings-, 415 Validierungs- und 1.375 Testbilder.

Danach machten die Validierungswerte der einzelnen Klassen einen ziemlich großen Sprung:

{{figure:1}}

Sieht nach einer enormen Verbesserung aus. Auf diesem Validierungssplit war es das auch. Nur hatte ich ein Detail zunächst unterschätzt: Die 415 Validierungsbilder waren vergleichsweise sauber, häufig sahen sie aus wie Aufnahmen auf einer Tischplatte.

Die Frage war also nicht mehr bloß, ob die Zahl gestiegen war. Ich wollte wissen, ob das Modell Müll besser erkannte oder ob es besonders gut geworden war, *solche Bilder* zu erkennen.

### Zwei gute Ergebnisse. Aber was heißt eigentlich gut?

EXP-014 kam mit seinem älteren, vielfältigeren Datensatz auf **60,7 % mAP50** im damaligen Validierungssplit. Nach dem Neuaufbau erreichten EXP-018 und EXP-019 etwa **90,6 % mAP50** auf den 415 saubereren Bildern. Selbst beim zweiten Lauf kam fast dieselbe Zahl heraus.

Dasselbe Projekt, deutlich höherer Wert, reproduzierbares Ergebnis. Du kannst dir vorstellen, warum ich so begeistert war. Das neuere Modell hatte also gewonnen, oder?

Na ja. Auf weniger kontrollierten Bildern wurde mir diese Schlussfolgerung etwas unangenehm.

{{figure:0}}

In einem *separaten* Feld-Benchmark mit 805 Bildern erreichte EXP-014 **85,8 % F1 für die Anwesenheit von Klassen pro Bild**. Das war das beste Ergebnis unter elf dort getesteten Modellen. Klingt, als könnte man die 85,8 % einfach mit den 90,6 % vergleichen. Kann man aber nicht. Die Zahlen messen Unterschiedliches, und **EXP-019 war gar nicht Teil dieses Feld-Benchmarks**.

Bei **mAP50** werden vorhergesagte Klassen und Bounding Boxes bei einem Intersection-over-Union-Schwellenwert von 0,5 bewertet. Der **F1-Wert auf Bildebene** prüft dagegen, ob die richtigen Klassen irgendwo im Bild vorkommen, ohne die Boxen direkt zu bewerten. Unterschiedliche Metriken und unterschiedliche Datensätze – damit lässt sich keine Rangfolge aus 85,8 % und 90,6 % ableiten.

Ich habe also keinen fairen direkten Vergleich, der beweist, dass EXP-014 besser als EXP-019 ist. Dafür habe ich etwas weniger Befriedigendes, aber wesentlich Nützlicheres: einen Grund, daran zu zweifeln, ob mein sauberer Validierungssplit die Situationen abbildet, auf die es mir ankommt.

### Hinter der Zahl steckte ein anderes Problem

Bei der Klasse Trash wird das besonders deutlich. Auf den sauberen Validierungsbildern erreichte sie **97,5 % mAP50**. Bei EXP-014 lag ihr F1-Wert in der separaten Feldauswertung bei **54 %**. Auch hier lassen sich die Zahlen nicht direkt vergleichen. Sie zeigen mir aber, wie unterschiedlich dieselbe Klasse unter anderen Bedingungen abschneiden kann.

In der Realität ist Papier zerknüllt, Metall sieht aus verschiedenen Winkeln unterschiedlich aus und Gegenstände liegen übereinander. Gutes Licht und aufgeräumte Hintergründe sind keineswegs selbstverständlich. Wenn ich hauptsächlich auf sauberen Bildern trainiere und validiere, kann das Modell auf dem Papier wesentlich zuverlässiger aussehen als vor einem echten Müllhaufen.

Das macht EXP-019 nicht wertlos und EXP-014 nicht automatisch zum besseren Modell. Es zeigt vielmehr, dass mir noch ein Teil der Auswertung fehlt. Bevor ich beide Modelle auf denselben unabhängigen Bildern teste, einen Sieger auszurufen, wäre genau der Fehler, der mich überhaupt hierhergebracht hat.

### Raus aus dem Notebook

Selbst wenn ich dem Modell vertraute, blieb noch eine praktische Frage: Wie soll jemand es eigentlich benutzen?

MIRA hat inzwischen ein Kommandozeilentool für Webcam- und RTSP-Inferenz, optionales ByteTrack-Tracking, ein FastAPI-Dashboard, Datensatzwerkzeuge und verschiedene exportierte Modelle. Das Paket `mira-ai` liegt auf PyPI, die Modelldateien auf Hugging Face.

Beim Export kam der nächste Kompromiss dazu. Die ursprünglichen PyTorch-Gewichte sind etwa **5,47 MB** groß, der LiteRT/TFLite-Export für 320 Pixel etwa **3,02 MB**. Für ein kleines Zielgerät ist das attraktiv. Der dokumentierte Validierungswert des Exports lag aber bei **86,2 % mAP50**, nicht bei 90,6 %. Und eine kleinere Datei garantiert noch keine schnellere Inferenz.

{{figure:2}}

Für den finalen Detektor habe ich bisher keine Messwerte aus einem Deployment auf dem Raspberry Pi. Das ist ein weiteres Experiment, kein Erfolg, den ich schon mal vorsorglich auf die Projektseite schreiben kann.

Und die über 9.000 „Downloads“ auf Hugging Face? Das sind Abrufe von Modelldateien seit der Veröffentlichung, **nicht** 9.000 verschiedene Personen. Warum diese Unterscheidung wichtig ist, habe ich in einem [eigenen Blogartikel](/blog/beyond-the-download-count/) erklärt. Offenbar hat sogar mein Downloadzähler ein Validierungsproblem.

### Und was wird jetzt aus EXP-020?

Mit EXP-020 möchte ich die naheliegende nächste Hypothese testen: die ausgewogenen, saubereren Trainingsdaten hinter EXP-019 mit den abwechslungsreichen Hintergründen kombinieren, wegen derer EXP-014 überhaupt wieder interessant wurde. Danach sollen die Modelle unter tatsächlich vergleichbaren Bedingungen ausgewertet werden.

Ein verifiziertes Ergebnis für EXP-020 habe ich hier noch nicht. Auch die unabhängigen 1.375 Testbilder wurden noch nicht für eine abschließende Bewertung dieser Läufe verwendet. MIRA ist weiterhin ein Experiment, kein autonomer Recyclingroboter.

Würde ich mich über einen höheren Wert freuen? Natürlich. Aber ich möchte, dass mir die Zahl auch etwas darüber sagt, was das Modell *außerhalb* des Validierungssplits kann.

Über die 90,6 % habe ich mich damals riesig gefreut. Finde ich immer noch ein schönes Ergebnis. Nur war das Interessanteste daran letztlich die Frage, die der Wert nicht beantworten konnte.

## In Zahlen

- Protokollierte Experimente: EXP-001 bis EXP-019; EXP-020 geplant/im Training, hier noch ohne Ergebnis
- Bester dokumentierter Wert auf sauberen Validierungsdaten: 90,6 % mAP50 (EXP-018), 90,58 % beim zweiten Lauf (EXP-019), 415 Bilder
- Feld-Benchmark: EXP-014, 85,8 % F1 für Klassenanwesenheit pro Bild (92,9 % Precision, 79,7 % Recall), 805 Bilder
- Datensatz: 6.898 Bilder, 12.832 Boxen (5.108 Training / 415 Validierung / 1.375 Test)
- Detektor: YOLO11n, etwa 2,58 Millionen Parameter
- Modellgrößen: PyTorch 5,47 MB; LiteRT-Export mit 320 Pixeln 3,02 MB
- Dokumentierter Validierungswert des 320-Pixel-LiteRT-Exports: 86,2 % mAP50
- GPU-Inferenz: 1,5 bis 3,6 ms pro Bild auf einer T4 im dokumentierten Aufbau, keine Messung auf dem Raspberry Pi
- Downloads: über 9.100 Modellabrufe insgesamt auf Hugging Face (Dateiabrufe, keine Anzahl von Personen)

## Abbildungen

- ![Liniendiagramm der Validierungs-mAP50 für die YOLO11n-Läufe EXP-013 bis EXP-019. Die ersten fünf Läufe liegen zwischen 55 und 61 Prozent, die letzten beiden bei 90,6 Prozent.](mira/detector-history.de.png) Validierungs-mAP50 über die YOLO11n-Läufe.
- ![Balkendiagramm der mAP50 pro Klasse, früherer Datensatz gegen sauberen Datensatz: Glas 50,2 zu 90,8, Metall 71,3 zu 94,8, Papier 82,9 zu 88,7, Plastik 72,1 zu 81,1, Trash 26,9 zu 97,5.](mira/class-map.de.png) mAP50 pro Klasse, vor und nach dem Neubau der Daten.
- ![Balkendiagramm der Dateigröße des endgültigen Modells: PyTorch 5,47 MB, ONNX 10,61 MB, LiteRT mit 320 Pixeln 3,02 MB und mit 640 Pixeln 3,04 MB.](mira/export-sizes.de.png) Dateigröße des Modells nach Exportformat.

## Links

- [Quellcode-Repository: MIRA-AI](https://github.com/jeremy341/MIRA-AI)
- [Projektwebsite](https://mira-vision.vercel.app/)
- [Hugging-Face-Modelldateien](https://huggingface.co/Jeremy341/MIRA-AI)
- [PyPI-Paket: mira-ai](https://pypi.org/project/mira-ai/)
