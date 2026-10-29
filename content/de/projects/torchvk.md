# TorchVK

- Ursprüngliche Inhalts-ID: torch
- Kategorie: Systeme & Rechnen
- Status: Frühe Forschung
- Technologien und Themen: [Vulkan](https://www.vulkan.org/), [PyTorch](https://pytorch.org/), GPU-Computing

## Zusammenfassung

Ich will PyTorch-Training auf GPU-Compute über [Vulkan](https://www.vulkan.org/) ausprobieren, auf einer Consumer-Karte, mit der die üblichen Stacks nicht gut zurechtkommen.

## Kontext und Motivation

Die meisten Deep-Learning-Anwendungen auf GPUs setzen auf CUDA von NVIDIA oder ROCm von AMD. Bei manchen Consumer-Karten sind diese Stacks aber schwach oder fehlen ganz. Dann hat man eine schnelle Grafikkarte, die nur für Spiele taugt. Genau dieses Problem ist der Ausgangspunkt für TorchVK. Ich will einen anderen Weg finden: PyTorch-Training und allgemeines GPU-Computing über [Vulkan](https://www.vulkan.org/), das auf fast jeder modernen Grafikkarte läuft.

Ich habe mir bewusst ein konkretes Ziel ausgesucht, eine Radeon RX 5600 XT mit 6 GB Speicher unter Windows. Wer für alle GPUs gleichzeitig schreibt, bleibt vage. Eine Karte, die mir gehört, gibt mir dagegen eine Frage, die ich tatsächlich beantworten kann.

## Im Projekt

TorchVK steckt noch in der Planung. Das öffentliche Repository enthält Dokumente, aber noch kein Backend, keinen Shader und keinen Benchmark. Vorhanden sind die Frage, eine Übersicht über verwandte Arbeiten und der Entwurf, den ich testen will. Ich sage das lieber offen, als das Repository weiter aussehen zu lassen, als es ist.

### Die Frage

Kann PyTorch-Training auf einer Consumer-GPU über [Vulkan](https://www.vulkan.org/) Compute laufen, auf einer Karte, die CUDA und ROCm schlecht unterstützen? Die Experimente sollen das mit Messungen beantworten. Die Antwort kann auch „noch nicht“ lauten, und das würde ich trotzdem aufschreiben.

### Verwandte Arbeiten, und warum das keine Premiere ist

Vulkan-Backends für [PyTorch](https://pytorch.org/) gibt es bereits, TorchVK behauptet also nicht, das erste zu sein. torchvulkan dokumentiert ein PrivateUse1-Gerät, auf dem MNIST-Training und ein winziges [GPT](https://openai.com/) laufen. Dazu kommen torch-vulkan und das ältere Vulkan-Backend von [PyTorch](https://pytorch.org/) selbst. Die Lücke, die ich testen will, ist enger. Ich möchte Training, das sich nachprüfen lässt und wirklich nur auf der GPU läuft, ohne stillen Rückfall auf die CPU. Außerdem möchte ich Kompatibilität mit einer RDNA1-Karte unter Windows, ein kleines CNN mit wenig Grafikspeicher trainieren und Benchmarks, die andere auf ihrem eigenen Rechner nachvollziehen können.

### Der geplante Entwurf

[PyTorch](https://pytorch.org/) spricht mit einem eigenen PrivateUse1-Gerät. Das ist eine C++-Erweiterung, die [Vulkan](https://www.vulkan.org/) ansteuert. Die Shader werden in GLSL oder Slang geschrieben und zu SPIR-V kompiliert.

```text
PyTorch  ->  PrivateUse1-Gerät  ->  TorchVK-C++-Erweiterung
         ->  Vulkan-Gerät, Allocator, Queues, Pipeline-Cache
         ->  GLSL oder Slang  ->  SPIR-V  ->  GPU
```

Die erste Übung ist bewusst klein: ein Gerät auswählen, Staging- und Gerätepuffer anlegen, einen Shader kompilieren, eine Vektoraddition starten, auf das Ende warten und das Ergebnis mit der CPU vergleichen. Stimmt das nicht überein, lohnt sich alles darüber nicht.

### Die Experimente, zuerst aufgeschrieben

Sechs Experimente stehen fest, bevor es Code gibt: Vektoraddition von eintausend bis zehn Millionen Elementen, Matrixmultiplikation von 128 bis 4096, ein MNIST-Klassifikator, ein CIFAR-10-CNN, die Empfindlichkeit gegenüber wenig Grafikspeicher und Ablationen, bei denen jeweils nur eine Sache verändert wird. Die Spalte für die Ergebnisse ist absichtlich leer. Schreibe ich den Plan vorher auf, kann ich mir später nicht still die Experimente aussuchen, die gut aussehen.

## In Zahlen

- Stufe: R0, die Übersicht über Mitbewerber und die Prüfung der Hardware-Machbarkeit; jeder Punkt davon ist noch offen
- Code: noch keiner, das Repository enthält nur Planungsdokumente
- Geplante Experimente: 6
- Benchmarks und Ergebnisse: keine
- Zielhardware: Radeon RX 5600 XT, 6 GB
- Geschätzter Aufwand: laut Roadmap 300 bis 650 Stunden oder mehr für ein vollständiges Ergebnis mit geprüftem Bericht

## Aktueller Stand

TorchVK ist frühe Forschung und kein fertiges GPU-Backend. Das Repository sagt selbst, dass es noch kein nutzbares Backend gibt, und es behauptet keine Leistungs- oder Kompatibilitätsergebnisse. Außerdem nennt es, was das Projekt nicht versuchen will: universelle Hardwareunterstützung, Autograd neu erfinden, sehr große Sprachmodelle trainieren, CUDA ersetzen oder Beschleunigungen versprechen.

Die Angaben zu Mitbewerbern sind eine Momentaufnahme vom 10. Oktober 2026. Keines der Ergebnisse der anderen Projekte habe ich selbst nachgebaut, deshalb zitiere ich sie so, wie ihre Autoren sie angeben.

## Links

- [Quellcode-Repository: TorchVK](https://github.com/jeremy341/TorchVK)
