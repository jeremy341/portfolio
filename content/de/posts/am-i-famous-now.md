---
title: "Bin ich jetzt berühmt?"
description: "Was die damals über 8.300 Downloads von MIRA auf Hugging Face wirklich aussagen – und was nicht."
slug: am-i-famous-now
publishedAt: 2026-10-29
tags: [mira, hugging-face]
---

Hi! Wenn du das hier liest, hat mein Clickbait wohl funktioniert. Vor Kurzem habe ich auf [Hugging Face](https://huggingface.co/) die Marke von 8.300 Downloads insgesamt geknackt.

Klingt ziemlich gut, oder? Na ja.

Es gibt da ein kleines Problem: Die Downloads auf Hugging Face sind nicht ganz das, wonach sie klingen.

## Was ist überhaupt passiert?

Erst mal zum Kontext. Das Projekt, mit dem ich die 8.300 geknackt habe, heißt [MIRA](/work/mira/), kurz für Machine Intelligence for Recycling Automation. Angefangen hat es mit einer einfachen Frage: Kann man mit einer günstigen Kamera und einem kleinen Modell verschiedene Müllsorten unterscheiden? Ich habe das Modell trainiert, die Dateien auf [Hugging Face](https://huggingface.co/) hochgeladen und der Zähler stieg. Und stieg.

Neben einem Modell, das ich selbst gebaut und benannt hatte, plötzlich diese Zahl zu sehen, war schon ziemlich verrückt. Zum ersten Mal hatte etwas, das ich gebaut habe, offenbar Menschen erreicht, die ich noch nie getroffen hatte. Das fühlte sich verdammt gut an.

## Und wo ist jetzt das Problem?

Was meine ich also damit, dass Downloads nicht wirklich Downloads sind? Das musste ich selbst erst nachlesen. [Hugging Face](https://huggingface.co/) zählt weder Personen noch Klicks, sondern Abrufe bestimmter Dateien, meistens der [`config.json`](https://huggingface.co/docs/hub/models-download-stats).

Wenn jemand ein Modell fünfmal lädt, kann der Zähler also fünfmal hochgehen. Und in meinem Repository liegen im Grunde 19 verschiedene Modellversionen. Das kann die Statistik ziemlich aufblähen. Umgekehrt wird ein weiterer Lauf unter Umständen gar nicht erfasst, wenn die Datei schon im lokalen Cache liegt.

Die Zahl sagt mir also, wie oft eine Datei abgerufen wurde. Nicht, wie viele Menschen das Modell nutzen.

8.300 Downloads sind nicht 8.300 Personen. Immer noch cool, aber das sollte man dazusagen.

## Also doch nicht berühmt?

Nicht wirklich. Trotzdem ist es ein schönes Gefühl, zu sehen, dass etwas, das ich gebaut habe, von anderen Orten aus abgerufen wird. Selbst wenn ein Teil der Abrufe von Bots kommt: Ein paar echte Nutzer wären immer noch besser als gar keine.

## Wie geht es weiter?

[MIRA](/work/mira/) liefert zwar gute Ergebnisse, ist aber noch lange nicht perfekt. Ich war eine Weile nicht dazu gekommen, daran weiterzuarbeiten. Jetzt habe ich wieder etwas Zeit und möchte ein besseres Modell trainieren. EXP-019 ist nämlich vermutlich [benchmaxxed](https://en.wikipedia.org/wiki/Overfitting): so stark auf einen Test optimiert, dass es dort super aussieht, im echten Einsatz aber womöglich nicht so gut klarkommt.

Das war's eigentlich schon. Ich hoffe, ihr hattet Spaß beim Lesen. Viel Erfolg bei euren eigenen Projekten, und falls ihr Zeit habt, schaut gerne bei meinem vorbei.

Falls wir uns nicht mehr sehen: Guten Tag, guten Abend und gute Nacht! Tschüss!
