# TorchVK

- Ursprüngliche Inhalts-ID: torch
- Kategorie: Systeme & Compute
- Status: Frühe Forschung
- Technologien und Themen: Vulkan, PyTorch, GPU-Computing

## Zusammenfassung

Kann ich PyTorch-Modelle über Vulkan auf meiner alten AMD-GPU trainieren? TorchVK ist noch in der Forschungsphase, kein funktionierendes Backend.

## Story

Die meisten Trainingsläufe für MIRA habe ich auf Kaggle gemacht. Nichts besonders Ungewöhnliches, bis auf ein kleines Detail: In meinem eigenen Rechner steckte bereits eine GPU.

Eine AMD Radeon RX 5600 XT, um genau zu sein.

Lange habe ich einfach akzeptiert, dass PyTorch-Training unter Windows auf dieser Karte keine wirkliche Option war. Auf Kaggle lief mein Notebook ja. Warum sollte ich mir darüber Gedanken machen? Erst als ich über ein weiteres Machine-Learning-Projekt nachdachte, fing mich das an zu stören.

Warum leihe ich mir Rechenleistung, wenn ich selbst eine GPU besitze? Und wenn meine Grafikkarte nicht plötzlich das Rechnen verlernt hat, was hält PyTorch eigentlich davon ab, sie zu benutzen?

So fing TorchVK an. Nicht mit einem bahnbrechenden Benchmark, sondern mit einer Frage, die ich lange ignoriert hatte.

### Die GPU funktioniert. Der Software-Stack ist das Problem.

In den meisten PyTorch-Tutorials ist `torch.cuda` der selbstverständliche Weg, ein Modell auf der GPU zu trainieren. Bei unterstützten NVIDIA-Karten ergibt das Sinn: CUDA hat ausgereifte Bibliotheken und ist tief in PyTorch integriert. AMD bietet ROCm an, aber welche Grafikkarten, Betriebssysteme und Versionen unterstützt werden, spielt eine entscheidende Rolle. Meine RX 5600 XT unter Windows ist dafür kein unkompliziertes Ziel.

Was mich daran stört: Das bedeutet nicht, dass die Karte keine parallelen Berechnungen ausführen kann. Grafikanwendungen laufen darauf, und [Vulkan](https://www.vulkan.org/) stellt Compute-Funktionen unabhängig vom GPU-Hersteller bereit.

Vulkan schien also ein möglicher Ausweg aus dem Supportproblem zu sein. Wenn die GPU Vulkan-Compute-Shader ausführen kann, könnte ich diese Fähigkeit doch irgendwie mit PyTorch verbinden.

Nur liegt zwischen *einem* funktionierenden Shader und dem Training eines neuronalen Netzes ein ziemlich großer Unterschied.

Ein Trainings-Backend muss Tensoren speichern, viele verschiedene Operationen ausführen, numerisch korrekte Ergebnisse liefern und Gradienten verarbeiten, damit sich die Modellparameter aktualisieren lassen. Hinzu kommen Speicherverwaltung und Synchronisation. Wenn nach jeder Operation die Daten erst wieder zur CPU kopiert werden, ist mit einem funktionierenden Shader noch nicht viel gewonnen.

Die Frage lautet also nicht „Kann Vulkan Zahlen addieren?“, sondern „Lässt sich darauf ein brauchbarer Trainingspfad aufbauen, und wie viel davon läuft tatsächlich auf der GPU?“

### Dann stellte ich fest, dass ich nicht der Erste war

Ich habe angefangen, mich mit vorhandenen Ansätzen wie [torchvulkan](https://github.com/zainsharief/torchvulkan) zu beschäftigen. Andere hatten sich bereits mit der Integration von Vulkan in PyTorch auseinandergesetzt.

Im ersten Moment klang das, als hätte sich meine Idee damit erledigt. Wozu noch ein Backend bauen, wenn es schon eines gibt?

Aber nur weil jemand an demselben Thema gearbeitet hat, wird die Forschung nicht plötzlich sinnlos. Im Gegenteil: Ich habe jetzt etwas Konkretes, das ich untersuchen kann. Trainiert eine vorhandene Lösung Modelle auf *meiner* RX 5600 XT? Weicht sie unbemerkt auf die CPU aus? Kann ich ihre Ergebnisse reproduzieren, fehlende Operationen identifizieren und messen, wo die Zeit verloren geht?

Das ist eine engere und ehrlich gesagt wesentlich nützlichere Forschungsfrage, als zu verkünden, ich hätte Machine Learning mit Vulkan erfunden.

Wenn ein vorhandenes Backend besser funktioniert, ist es vielleicht sinnvoller, daran mitzuarbeiten, als eine schlechtere Kopie zu pflegen. Ich will das Problem verstehen, keinen Namenswettbewerb gewinnen.

### Womit würde PyTorch eigentlich kommunizieren?

Eine mögliche Schnittstelle ist **PrivateUse1**. Damit lassen sich eigene Geräte-Backends in PyTorch registrieren. Die Operatoren könnten so mit einer C++-Runtime verbunden werden, die GPU-Puffer anlegt, Operationen abschickt und die Ergebnisse synchronisiert.

Diese Runtime würde Vulkan-Compute-Pipelines mit **SPIR-V** aufrufen, der Zwischendarstellung, die Vulkan für Shader verwendet. So stelle ich mir die Architektur zurzeit vor – als *Hypothese*:

```flow
PyTorch-Operation
Geräteintegration über PrivateUse1
TorchVK-C++-Runtime: Speicher, Dispatch, Synchronisation
Vulkan-Compute-Pipeline
SPIR-V-Shader auf der GPU
```

Bei so einem Diagramm stellt man sich schnell ein funktionierendes Backend vor. Kästchen sind allerdings leicht gezeichnet. Schwieriger wird es, wenn sich alle über Speicherbesitz, Tensorformen und Ausführungsreihenfolge einig sein müssen.

Der erste sinnvolle Meilenstein ist viel kleiner: Puffer anlegen, Werte an die GPU übertragen, einen Shader zur Vektoraddition ausführen, das Ergebnis zurückholen und jeden Wert mit einer verlässlichen CPU-Berechnung vergleichen.

Vektoraddition ist vermutlich nicht gerade die aufregendste Errungenschaft im Machine Learning. Genau deshalb eignet sie sich so gut. Wenn ich nicht einmal eine kleine Operation korrekt ausführen kann, würde ein Benchmark für ein ganzes neuronales Netz mir nur zeigen, wie schnell ich einen Fehler berechne.

### Sechs Experimente, eine Frage nach der anderen

Sobald eine Operation zuverlässig funktioniert, kann ich mich an die Performance wagen. Aber auch da gibt es eine sinnvolle Reihenfolge.

Zuerst die **Vektoraddition**: Sie prüft die Korrektheit und zeigt, wie teuer Speichertransfers und Dispatch bei kleinen Arbeitslasten sind. Danach die **Matrixmultiplikation**, eine Operation, die für neuronale Netze tatsächlich wichtig ist und bei der Speicherzugriffe und Shader-Design deutlich mehr ausmachen.

Wenn das klappt, soll ein **MNIST-Training** prüfen, ob Forward- und Backward-Pass auf der GPU bleiben können. Ein **CIFAR-10-CNN** würde komplexere Operationen hinzubringen. **Tests mit wenig VRAM** sollen zeigen, was passiert, wenn meiner älteren Karte mit ihren 6 GB der Speicher knapp wird.

Zum Schluss kommen **Ablationsstudien**: jeweils nur eine Implementierungsentscheidung ändern und prüfen, welchen Einfluss sie hat. Sonst ändert man fünf Einstellungen auf einmal, bekommt einen schnelleren Lauf und hat absolut keine Ahnung, warum.

Ein schneller GPU-Kernel ist außerdem nicht dasselbe wie ein schneller Trainingsschritt von Anfang bis Ende. Dispatch-Overhead, Transfers, Synchronisation und ungewollte CPU-Fallbacks können jeden Vorteil aus einem isolierten Benchmark wieder zunichtemachen.

Jedes Experiment soll daher eine Frage beantworten, die das *nächste* Experiment sinnvoll macht. Ansonsten sammle ich bloß Zahlen.

### Das Ergebnis, das ich noch nicht habe

Nach dem im öffentlichen Repository dokumentierten Stand befindet sich **TorchVK noch in der Machbarkeitsphase**. Es gibt kein funktionierendes Trainings-Backend, keinen implementierten GPU-Compute-Shader und keine gemessenen Benchmark-Ergebnisse, die ich hier angeben könnte.

Ich könnte diese Seite deutlich beeindruckender klingen lassen, indem ich die Roadmap wie erledigte Arbeit beschreibe. Nur würde das nichts daran ändern, was tatsächlich existiert.

Der nächste konkrete Schritt ist eine korrekte Geräteoperation ohne versteckten CPU-Fallback. Danach kommt ein fairer Performancevergleich. Erst dann lohnt es sich, ernsthaft übers Training zu sprechen.

Vielleicht bekommt meine alte AMD-Karte über Vulkan tatsächlich einen brauchbaren Trainingspfad. Vielleicht stelle ich fest, dass eine andere Implementierung besser ist oder der Overhead viel größer ausfällt als erwartet. In beiden Fällen werde ich GPU-Software wesentlich besser verstehen als damals, als ich automatisch Kaggle geöffnet habe.

Und genau damit fing das Ganze an: Wenn ich die Hardware schon habe, was müsste ich tun, um sie auch wirklich nutzen zu können?

## In Zahlen

- Phase: R0, Forschung und Machbarkeit; kein fertiges GPU-Trainings-Backend
- Code: kein implementiertes Backend und kein Shader im öffentlichen Repository
- Geplante Experimente: 6 (keine abgeschlossenen Benchmarks)
- Benchmarks und Ergebnisse: keine
- Zielhardware: Radeon RX 5600 XT, 6 GB VRAM, Windows
- Roadmap: geschätzte 300 bis über 650 Stunden für das gesamte Forschungsvorhaben, keine bereits geleisteten Stunden

## Links

- [Quellcode-Repository: TorchVK](https://github.com/jeremy341/TorchVK)
- [PyTorch-Dokumentation](https://pytorch.org/)
- [Vulkan-Übersicht](https://www.vulkan.org/)
