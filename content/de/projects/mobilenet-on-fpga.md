# MobileNet on FPGA

- Ursprüngliche Inhalts-ID: fpga
- Kategorie: Hardware & Embedded
- Status: In Arbeit
- Technologien und Themen: MobileNet, Quantisierung, TFLite, FPGA

## Zusammenfassung

Ich habe MobileNetV1 und V2 auf INT8 quantisiert und Größe und Genauigkeit verglichen – als Vorbereitung auf eine mögliche FPGA-Implementierung.

## Story

Ein neuronales Netz kleiner zu machen, klingt erst mal nach einer offensichtlichen Verbesserung, wenn es auf begrenzter Hardware laufen soll. Weniger Speicher, günstigere Berechnungen und hoffentlich weniger Stromverbrauch. Nur hat die Sache einen Haken: Bei einer kleineren Zahlendarstellung geht Präzision verloren.

Wie viel Genauigkeit verliert also das Modell mit den zusätzlichen Bits?

Das war die Ausgangsfrage meines MobileNet-Experiments im Rahmen der Projektarbeit am Lehrstuhl für Elektronische Bauelemente und Schaltungen der Universität Duisburg-Essen. Langfristig geht es um FPGAs: Dort kann man die Rechenlogik selbst entwerfen, statt sich auf eine universell einsetzbare GPU zu verlassen. Bevor ich über einen Beschleuniger nachdenken konnte, wollte ich allerdings wissen, welches Zahlenformat er überhaupt unterstützen müsste.

Die Ergebnisse waren etwas weniger vorhersehbar, als der Ausdruck „geringere Präzision“ vermuten lässt.

### Kleine Modelle zuerst

Ich habe MobileNetV1 und MobileNetV2 gewählt, weil beide Architekturen auf Effizienz ausgelegt sind.

Eine gewöhnliche Convolution verarbeitet räumliche Informationen und mischt dabei die Kanäle in einer einzigen, aufwendigen Operation. Eine **Depthwise Separable Convolution** teilt diese Aufgabe auf: Zunächst wird jeder Kanal einzeln verarbeitet, anschließend kombiniert eine Pointwise Convolution die Kanäle. MobileNetV2 geht mit **Inverted Residual Blocks** noch einen Schritt weiter. Die Anzahl der Kanäle wird für die Berechnung erhöht und anschließend durch einen linearen Bottleneck wieder reduziert.

Das sind wichtige Entscheidungen, wenn die Berechnungen später auf begrenzter Hardware laufen sollen. Außerdem hatte ich so zwei unterschiedliche Architekturen zum Vergleichen, ohne gleich mit einem riesigen Modell anzufangen.

Ich habe beide Netze in Keras implementiert, statt vortrainierte Gewichte zu laden. Beide verwendeten RGB-Eingaben mit 128×128 Pixeln und einen Width Multiplier von 0,5, also weniger Kanäle. Trainiert habe ich mit CIFAR-10, aufgeteilt in 45.000 Trainings-, 5.000 Validierungs- und 10.000 Testbilder, mit Adam und Early Stopping.

Die Originalbilder von CIFAR-10 sind nur 32×32 Pixel groß. Durch das Hochskalieren auf 128×128 kommen keine neuen Details hinzu. Es ging um einen kontrollierten Softwarevergleich, nicht um den Nachweis, dass sich die Netze auf einer echten Kamera oder einem FPGA genauso verhalten.

### Von Float32 zu INT8

Die Float32-Modelle stellen Werte als 32-Bit-Gleitkommazahlen dar. Das bietet einen großen Wertebereich und eine gewisse numerische Präzision, kostet aber Speicher und erfordert komplexere Rechenoperationen.

Bei der **INT8-Quantisierung** werden diese Werte durch vorzeichenbehaftete 8-Bit-Ganzzahlen angenähert, typischerweise im Bereich von −128 bis 127. Skalierungsfaktoren stellen den Zusammenhang mit den ursprünglichen Werten her.

Der offensichtliche Vorteil: Die Gewichte brauchen weniger Bytes. Spannender ist der Einfluss auf die Vorhersagen. Werden zwei ursprünglich verschiedene Aktivierungswerte auf dieselbe Ganzzahl gerundet, verliert das Netz Informationen. Wiederholt sich das bei vielen Operationen, würde man eigentlich mit einem sichtbaren Genauigkeitsverlust rechnen.

Um herauszufinden, ob das tatsächlich passiert, habe ich die Modelle zunächst in Float32 trainiert und anschließend in vollständig ganzzahlige TFLite-Modelle umgewandelt. Mit 200 Kalibrierbildern wurden die benötigten Wertebereiche abgeschätzt. Die exportierten Modelle nutzten INT8 sowohl für Eingaben als auch für Ausgaben.

Der Plan war einfach: beide Versionen auf denselben 10.000 Testbildern vergleichen und schauen, wie viel uns die geringere Präzision kostet.

### Die Genauigkeit

Die dokumentierten Ergebnisse:

| Modell | Float32 | INT8 | Differenz |
| --- | ---: | ---: | ---: |
| MobileNetV1 | 76,72 % | 76,35 % | −0,37 Prozentpunkte |
| MobileNetV2 | 77,93 % | 77,94 % | +0,01 Prozentpunkte |

{{figure:0}}

MobileNetV1 verlor 0,37 Prozentpunkte. Nicht besonders viel, aber immerhin in der erwarteten Richtung.

Bei MobileNetV2 wurde es interessanter: Der INT8-Export erreichte **77,94 %**, die Float32-Version **77,93 %**. Hat die geringere Präzision das Modell also besser gemacht?

Nicht wirklich. Bei 10.000 Testbildern entspricht dieser Unterschied genau *einer* zusätzlichen richtigen Vorhersage. Ein Trainingslauf und ein Testdatensatz reichen nicht aus, um daraus eine Verbesserung durch Quantisierung abzuleiten. Aussagekräftig ist vielmehr, dass die gemessene Genauigkeit nahezu unverändert blieb.

Und damit zurück zur Frage, wegen der ich das eigentlich angefangen hatte. Wenn sich die Vorhersagen kaum ändern, wie viel Speicher spare ich dann?

Bei den Dateigrößen war der Unterschied wesentlich deutlicher:

| Modell | Float32 TFLite | INT8 TFLite |
| --- | ---: | ---: |
| MobileNetV1 | 3,29 MB | 0,99 MB |
| MobileNetV2 | 2,35 MB | 0,85 MB |

{{figure:1}}

Die Dateien waren damit etwa um den Faktor **3,34** bei V1 und **2,78** bei V2 kleiner. Interessant waren also nicht die zusätzlichen 0,01 Prozentpunkte, sondern der eingesparte Speicher, ohne dass in diesem Test ein wesentlicher Genauigkeitsverlust sichtbar wurde.

Eine kleinere Datei macht ein Netz aber nicht automatisch schneller.

### Warum Größe nicht reicht

Auf einem FPGA muss man entscheiden, mit welchen Rechenressourcen die einzelnen Operationen ausgeführt werden. Das Produkt zweier INT8-Werte kann bis zu **16 Bit inklusive Vorzeichen** benötigen. Bei einer Convolution werden anschließend viele solcher Produkte aufsummiert. Der Akkumulator braucht also ausreichend Bits, damit kein Überlauf entsteht.

Aus den Layer-Dimensionen und der Anzahl der zu summierenden Produkte habe ich die erforderlichen Bitbreiten untersucht. Für die dokumentierten Konfigurationen reicht ein 32-Bit-Akkumulator aus.

Das ist für die Planung hilfreich. Ich weiß damit mehr über die Rechenoperationen, die eine spätere Implementierung unterstützen müsste, und kann Speicherbedarf und Arithmetik abschätzen, bevor ich überhaupt Hardwarebeschreibungen schreibe.

Was ich damit nicht weiß: wie viele DSP-Blöcke die Implementierung braucht, wie viel Strom sie verbraucht oder wie schnell sie ein Bild klassifiziert. Den FPGA-Teil habe ich noch nicht implementiert; gemessene Ressourcen- oder Latenzwerte gibt es nicht.

Das Experiment beantwortet eine Frage zur *Darstellung des Modells*. Nicht die nächste Frage zur *Ausführung auf Hardware*.

### Was ich als Nächstes testen würde

Auch der Softwarevergleich selbst hat Grenzen. Ich habe mit **einem Trainings-Seed** gearbeitet und kenne deshalb die Streuung zwischen unabhängigen Läufen nicht. Bei der dokumentierten Auswahl der Kalibrierbilder überschnitten sich 25 Bilder mit dem Validierungssplit. Das würde ich korrigieren, indem ich ausschließlich aus dem Trainingssplit ziehe.

Bei der Auswertung der quantisierten Eingaben wurde außerdem abgeschnitten statt gerundet. Gerade bei kleinen Genauigkeitsunterschieden sollte ich das korrigieren. Und auch Overfitting ist in den Trainingskurven erkennbar: Die Trainingsgenauigkeit näherte sich 100 %, während die Validierungsgenauigkeit stagnierte.

Das macht die Ergebnisse nicht wertlos. Es bedeutet, dass ich genau sagen muss, was sie zeigen.

Als Nächstes würde ich mehrere Seeds verwenden, Kalibrierung und Eingabekonvertierung korrigieren und die komplette Inferenz auf einem konkreten Zielgerät messen. Erst dann kann ich über eine tatsächliche FPGA-Beschleunigung sprechen.

Angefangen habe ich mit der Sorge, dass INT8 ein kleines Modell zu ungenau machen könnte. In diesem Versuch war das nicht der Fall. Das ist ein guter Grund weiterzumachen, aber kein Freifahrtschein, um zu behaupten, ich hätte einen schnellen Beschleuniger gebaut.

Und zu wissen, welche Frage ein Experiment tatsächlich beantwortet hat, ist bei einem Engineering-Projekt mindestens so wichtig wie eine beeindruckende Zahl.

## In Zahlen

- Datensatz: CIFAR-10, 45.000 Trainings- / 5.000 Validierungs- / 10.000 Testbilder
- Modelle: MobileNetV1 (834.666 Parameter) und MobileNetV2 (604.234 Parameter)
- Eingabe: 128×128 RGB, Width Multiplier 0,5
- Testgenauigkeit V1: Float32 76,72 %, INT8 76,35 %
- Testgenauigkeit V2: Float32 77,93 %, INT8 77,94 %
- Dateigröße V1: 3,29 MB Float32 TFLite, 0,99 MB INT8
- Dateigröße V2: 2,35 MB Float32 TFLite, 0,85 MB INT8
- Training: Adam mit 1e-3, Early Stopping nach 26 bzw. 23 Epochen, ein Seed
- Kalibrierung: 200 Bilder, bekannte Überschneidung mit dem Validierungssplit
- FPGA-Code und Ressourcenmessungen: keine

## Abbildungen

- ![Balkendiagramm der CIFAR-10-Testgenauigkeit: MobileNetV1 76,72 Prozent als Float32 und 76,35 als INT8, MobileNetV2 77,93 als Float32 und 77,94 als INT8.](mobilenet-on-fpga/accuracy.de.png) Testgenauigkeit vor und nach der INT8-Quantisierung.
- ![Balkendiagramm der TFLite-Dateigröße: MobileNetV1 3,29 MB als Float32 und 0,99 MB als INT8, MobileNetV2 2,35 MB und 0,85 MB.](mobilenet-on-fpga/size.de.png) Dateigröße der TFLite-Modelle, Float32 und INT8.

## Links

- [Quellcode-Repository: Mobilenet-fpga](https://github.com/jeremy341/Mobilenet-fpga)
- [Dokumentierter Vergleich und Auswertung](https://github.com/jeremy341/Mobilenet-fpga/blob/main/results/comparison.md)
- [Bitbreitenanalyse](https://github.com/jeremy341/Mobilenet-fpga/blob/main/results/bit_width_analysis.md)
