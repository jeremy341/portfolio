---
title: "Hinter den Downloadzahlen: Was MIRAs 8.300 Downloads bedeuten"
description: "Was MIRAs 8.300 Downloads auf Hugging Face tatsächlich erfassen, was die Zahl für mich bedeutet und wie es mit dem Projekt weitergeht."
slug: beyond-the-download-count
publishedAt: 2026-10-29
tags: [mira, hugging-face]
---

Eines meiner Machine-Learning-Projekte hat vor Kurzem die Marke von 8.300 Downloads auf [Hugging Face](https://huggingface.co/) erreicht. Darüber freue ich mich ziemlich. Allerdings lohnt es sich, genauer hinzuschauen, wie Hugging Face diese Downloads überhaupt zählt.

## Ein bisschen Kontext

Das Projekt heißt [MIRA](/work/mira/), kurz für Machine Intelligence for Recycling Automation. Angefangen hat es mit einer recht einfachen Frage: Kann man mit einer günstigen Kamera und einem kleinen Machine-Learning-Modell verschiedene Abfallarten unterscheiden?

Ich habe das Modell trainiert, die Dateien auf Hugging Face veröffentlicht und mit der Zeit ist der Downloadzähler immer weiter gestiegen.

Neben einem Modell, das ich selbst entwickelt habe, plötzlich 8.300 Downloads zu sehen, war ein ziemlich gutes Gefühl. Zum ersten Mal habe ich erlebt, dass sich so viele mir völlig unbekannte Menschen möglicherweise für etwas interessieren, das ich gebaut habe.

Ich wollte aber auch verstehen, was diese Zahl eigentlich aussagt.

## Wie Hugging Face Downloads zählt

Das musste ich selbst erst nachlesen. [Hugging Face](https://huggingface.co/) zählt weder einzelne Nutzer noch Klicks auf einen Downloadbutton, sondern Abrufe bestimmter Modelldateien, zu denen etwa die [`config.json`](https://huggingface.co/docs/hub/models-download-stats) gehören kann.

Wenn jemand das Modell fünfmal lädt, kann das als fünf Downloads gezählt werden. Im MIRA-Repository liegen außerdem rund 19 Modellversionen. Das macht es noch schwieriger, herauszufinden, wie viele verschiedene Personen hinter den Abrufen stecken.

Umgekehrt wird ein weiterer Start des Modells unter Umständen gar nicht erfasst, wenn die nötigen Dateien bereits im lokalen Cache liegen.

Die Zahl sagt mir also, wie oft bestimmte Dateien abgerufen wurden. Sie sagt mir nicht, wie viele Menschen das Modell tatsächlich nutzen.

**8.300 Downloads sind nicht 8.300 Nutzer.** Das ist ein wichtiger Unterschied, gerade wenn man die Downloadzahlen als Maß dafür nimmt, wie verbreitet ein Modell ist.

## Was die Zahl für mich bedeutet

Auch wenn ich nicht genau weiß, wie viele Menschen MIRA nutzen, finde ich es immer noch ziemlich cool, dass etwas, das ich gebaut habe, so oft abgerufen wurde.

Ein Teil der Abrufe könnte von automatisierten Systemen stammen, ein anderer von Leuten, die verschiedene Modellversionen ausprobieren. Zuverlässig auseinanderhalten kann ich das nicht.

Aber egal, ob es eine Handvoll Menschen sind oder deutlich mehr: Allein die Möglichkeit, dass jemand etwas von mir Gebautes nützlich findet, freut mich.

## Wie geht es mit MIRA weiter?

[MIRA](/work/mira/) hat zwar vielversprechende Ergebnisse erzielt, aber es gibt noch einiges zu tun. In letzter Zeit kam ich kaum dazu, an dem Projekt weiterzuarbeiten. Jetzt habe ich wieder etwas Zeit und möchte eine neue Version trainieren.

Beim aktuellen Modell EXP-019 habe ich die Vermutung, dass es zu stark auf einen bestimmten Benchmark optimiert wurde, also sozusagen *benchmaxxed* ist. Die gemessene Leistung könnte dadurch besser aussehen als die Leistung unter realen Bedingungen.

Bei der nächsten Version möchte ich mehr darauf achten, wie gut das Modell mit Daten zurechtkommt, die es beim Training noch nicht gesehen hat, statt einfach nur einen besseren Benchmarkwert zu erzielen.

Mir ist ein Modell, das auch außerhalb seiner Testumgebung zuverlässig funktioniert, deutlich lieber als eines, das bei einem bestimmten Benchmark beeindruckende Zahlen liefert.
