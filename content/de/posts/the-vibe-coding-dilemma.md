---
title: "Das Vibe-Coding-Dilemma: Zwischen Produktivität, Verständnis und Lernen"
description: "Bei Hack Club bewerte ich Projekte, die mit KI entstanden sind. Bei meinen eigenen nutze ich Claude und Codex. Und wo stehe ich damit?"
slug: the-vibe-coding-dilemma
publishedAt: 2026-11-16
readingMinutes: 7
tags: [ai, programming, hack-club, vibe-coding]
---

Ich bin ein überzeugter Befürworter von KI. Aber macht es mich zum Vibe Coder, wenn ich KI beim Programmieren einsetze? Und wenn ja, bin ich dann automatisch ein schlechter Programmierer?

Diese Frage beschäftigt mich in letzter Zeit. Ich verbringe nämlich ziemlich viel Zeit damit, KI für meine eigenen Projekte zu nutzen. Gleichzeitig gehört es zu meiner Arbeit als Reviewer, fremden Code zu prüfen und nach Anzeichen für den Einsatz von KI zu suchen.

Wo zieht man also die Grenze? Wann hört KI auf, ein Werkzeug zu sein, mit dem du etwas baust, und übernimmt das Bauen selbst? Und vor allem: **Auf welcher Seite stehe ich eigentlich?**

## Erst mal ein bisschen Kontext

Für alle, die [Hack Club](https://hackclub.com/) noch nicht kennen: Das ist eine Community von Jugendlichen, die programmieren, löten, Hardware entwickeln und so ziemlich alles bauen, was ihnen einfällt.

Hack Club veranstaltet Programme namens [YSWS](https://project.hackclub.com/overview/info/), kurz für *You Ship, We Ship*. Die Idee: Du baust und veröffentlichst etwas und kannst dafür Belohnungen bekommen. Ziemlich cooles Konzept, oder?

Für eines dieser Programme bin ich auch Reviewer. Ich schaue mir also regelmäßig GitHub-Repositories anderer Leute an, gehe ihre Commits durch und versuche herauszufinden, was sie gebaut haben und wie viel Arbeit wirklich dahintersteckt. Und ja, manchmal suche ich dabei auch nach KI-generiertem Code.

## Bin ich also einer von denen?

Bevor ich die Frage beantworte, müssten wir uns wahrscheinlich erst mal darauf einigen, wie [Vibe Coding](https://en.wikipedia.org/wiki/Vibe_coding) definiert ist. Je nachdem, wen du fragst, kann damit alles gemeint sein: von KI als Programmierhilfe bis hin zur kompletten App, deren Code sich niemand richtig angesehen hat. Das sind für mich zwei ziemlich unterschiedliche Dinge.

Erst mal: **Ich kann programmieren.** Das sollte ich wohl erwähnen, bevor jemand denkt, ich würde den ganzen Tag Prompts schreiben und Claude bei der Arbeit zuschauen.

Ich schreibe tatsächlich gerne Code. Meine UIs baue ich größtenteils selbst. Meistens arbeite ich in einer [IDE](https://en.wikipedia.org/wiki/Integrated_development_environment), in der ich meine Dateien sehe, den Code bearbeiten und nachvollziehen kann, was passiert. Ich werfe nicht einfach Prompts ins Terminal und nehme die App, die am Ende rauskommt. Obwohl das mein Leben manchmal deutlich einfacher machen würde.

Wie ich KI einsetze, hängt ziemlich stark vom Projekt ab. Nehmen wir [MIRA](/work/mira/). Bei der Entwicklung dieses Machine-Learning-Projekts habe ich mir jede einzelne Zeile Code angesehen. Ich wollte verstehen, was da passiert und warum bestimmte Entscheidungen getroffen wurden.

Und dann wäre da [PoorUp](/work/poorup/), ein Multiplayer-Spiel im Browser und vermutlich eines meiner größten Softwareprojekte. Ich habe viel Zeit in die Spielmechanik, die Features und die Frage gesteckt, wie alles zusammenspielen soll. Gerade bei Teilen des Backends habe ich mich aber auch ziemlich stark auf Claude und Codex verlassen.

Und nein, ich habe nicht jede Zeile gelesen, die dabei entstanden ist.

Ich könnte erklären, was die meisten Features machen, wie sie zusammenspielen und warum sie überhaupt existieren. Aber wenn du irgendeine Datei aus dem Backend öffnest und mich nach jeder einzelnen Funktion fragst? Gib mir kurz Zeit, den Code zu lesen.

Genau das finde ich interessant. In MIRA und PoorUp steckt viel von meiner Zeit, aber wie sehr ich mich mit dem jeweiligen Code beschäftigt habe, unterscheidet sich deutlich. Gehört MIRA deshalb mehr mir als PoorUp? Würde ich nicht sagen. Aber was bedeutet es eigentlich, etwas zu verstehen, das man selbst gebaut hat?

## Muss ich jede Zeile verstehen?

Nehmen wir [Egg](https://github.com/jeremy341/egg). Ich entwickle dort eine Deployment-Plattform für Hack Club Nest. Man soll seine Apps veröffentlichen können, ohne sich ständig per SSH auf dem Server einzuloggen und alles von Hand zu aktualisieren.

Vor Kurzem habe ich überlegt, wie sich der Build-Prozess ändern ließe. Warum nicht [GitHub Actions](https://docs.github.com/en/actions) den Build übernehmen lassen und Egg anschließend die fertige App schicken? Dann muss der eigentliche Server seine begrenzten Ressourcen nicht dafür verschwenden, eine Next.js-App oder irgendein anderes Projekt zu kompilieren. Klingt vernünftig, oder?

Und dann kommen die kleinen Details. Was, wenn der Build fehlschlägt? Wenn die App startet und direkt wieder abstürzt? Wie soll ein Rollback funktionieren? Was passiert mit den Umgebungsvariablen? Wie verhindert man, dass jemand einfach ein manipuliertes Release hochlädt?

Aus einer ziemlich simplen Idee wird auf einmal ein ganzes Engineering-Problem.

Und genau dieser Teil macht mir Spaß. Alternativen recherchieren, überlegen, wie sich das System verhalten soll, und verstehen, warum eine Lösung besser sein könnte als eine andere.

Könnte ich das gesamte System ohne KI von Grund auf implementieren? Wahrscheinlich. Mit genug Zeit, Dokumentation und einer ordentlichen Portion Frust. Wäre ich annähernd so schnell? Definitiv nicht.

Ich glaube aber nicht, dass man ein schlechterer Programmierer ist, nur weil man für etwas länger braucht. Es gibt genug Dinge, die ich noch nicht gelernt habe. Genau darum geht es beim Lernen doch.

Es macht allerdings einen Unterschied, ob ich verstehe, wie ein System funktionieren *soll*, oder weiß, wie es tatsächlich implementiert wurde. Wenn ich den Code nicht lese, kann ich mir beim Zweiten nicht immer sicher sein. Das ist erst mal kein Problem. Bis etwas kaputtgeht und ich plötzlich verstehen muss, warum.

**An dem Punkt kann zu viel Vertrauen in KI zum Problem werden.**

## Zurück zu den Projektreviews ...

Bei Reviews stoße ich manchmal auf Repositories, bei denen ich das Gefühl habe, dass sehr viel KI im Spiel war. Vielleicht sind es die Kommentare, die Commits, die Codestruktur oder eine UI, die mir verdächtig bekannt vorkommt.

Und ja, **eine gute UI ist kein Beweis für KI-Nutzung.** Ausführliche Kommentare oder gut strukturierter Code genauso wenig. Das können Gründe sein, genauer hinzusehen. Mehr aber auch nicht.

Schwierig ist die Frage, wie viel Arbeit jemand tatsächlich in sein Projekt gesteckt hat. Stell dir vor, zwei Leute reichen ein Spiel ein.

Die erste Person hat stundenlang Ideen ausprobiert, das Spiel geplant, Code geschrieben, Features getestet und sich bei schwierigen Stellen von KI helfen lassen.

Die zweite schreibt *„Mach mir ein cooles Spiel“*, nimmt das erste Ergebnis und reicht es ein, ohne wirklich zu verstehen, was da entstanden ist.

In beiden Projekten kann KI-generierter Code stecken. Ist das deshalb dasselbe? Für mich nicht.

Natürlich entscheiden die Regeln des jeweiligen YSWS darüber, was erlaubt ist. Meine Aufgabe ist es nicht, mir eigene Regeln auszudenken, je nachdem, ob mir der Programmierstil gefällt.

Das Problem ist: **KI-generierter Code allein verrät dir nicht, wie viel menschliche Arbeit in einem Projekt steckt.** Und das ist schwieriger zu beurteilen, als man denkt.

Wer PoorUp reviewt, könnte den KI-unterstützten Code sehen und daraus schließen, dass ich kaum programmieren kann. Die Person weiß vielleicht nichts von MIRA, wo ich ganz anders vorgegangen bin, oder davon, dass ich regelmäßig selbst Code schreibe und bei der Entwicklung technische Entscheidungen treffe.

Woher auch? Sie kennt mich nicht. Sie sieht nur das, was ich eingereicht habe.

Das sollte man meiner Meinung nach auch bei Reviews anderer Projekte im Hinterkopf behalten. KI-generierten Code zu erkennen und den tatsächlichen Arbeitsaufwand einer Person zu beurteilen, sind zwei verschiedene Dinge. Mir ist wichtiger, wie sich ein Projekt entwickelt hat, welche Entscheidungen die Person getroffen hat und was sie selbst beigetragen hat, als wie viel Code nach KI aussieht.

Natürlich ist das leichter gesagt als getan. Wie misst man den eigenen Beitrag einer Person, wenn KI in so ziemlich jeder Phase der Entwicklung eingesetzt werden kann? Und wie berücksichtigt man, dass das verwendete KI-Modell beeinflussen kann, wie ein Projekt wahrgenommen wird, ohne unbedingt etwas über den tatsächlichen Aufwand auszusagen?

Darüber habe ich bei meinen Reviews schon viel nachgedacht, aber ich glaube, das verdient einen eigenen Blogartikel.

## Macht KI mich zu einem schlechteren Programmierer?

Darüber denke ich tatsächlich viel nach. Ich liebe technische Informatik. Nicht nur Websites bauen oder irgendwelche Projekte zum Laufen bringen, sondern wirklich verstehen, wie Dinge funktionieren. GPUs, Machine Learning, Elektronik, Betriebssysteme. Es gibt so viel Interessantes zu lernen. Und ich würde behaupten, dass ich durch meine Projekte eine Menge gelernt habe. Auch mit KI.

Eine Sache macht KI allerdings unglaublich einfach: **die schwierigen Teile überspringen.**

Fehlermeldung? Frag Claude.

Komplizierte Backend-Logik? Frag Codex.

Diese eine blöde Funktion, die trotz einer Stunde Anstarren partout nicht funktionieren will? Na ja, lass sie doch von KI reparieren.

Du weißt, worauf das hinausläuft.

Plötzlich funktioniert etwas, das mich sonst Stunden gekostet hätte. Aber habe ich dabei auch gelernt, wie man das Problem löst? Da wird es etwas komplizierter.

Manchmal schon. Ich lese die Erklärung, schaue mir die Implementierung an und verstehe hinterher etwas Neues. Andere Male will ich hauptsächlich, dass dieses Feature endlich funktioniert, damit ich mit dem nächsten weitermachen kann. Und das Zweite habe ich vermutlich öfter gemacht, als ich zugeben möchte.

Denn **mit KI Zeit zu sparen ist etwas anderes, als mit KI dem Lernen aus dem Weg zu gehen.** Und mir ist nicht immer klar, was von beidem ich gerade tue.

Ich werde jetzt nicht so tun, als würde ich ab morgen jedes Stück Code von Hand schreiben. Wenn ich etwas schon verstanden habe und mir KI Stunden monotoner Arbeit erspart, sehe ich keinen Grund, darauf zu verzichten. Aber wenn ich bei etwas lande, das mich wirklich interessiert und das ich verstehen möchte, will ich es nicht sofort an Claude abgeben, nur weil das einfacher wäre.

Ich will immer noch ein besserer Programmierer werden. Nicht bloß jemand, der mit immer komplizierteren Prompts immer kompliziertere Software baut. Daran muss ich mich hin und wieder erinnern. Denn man kann sich leicht davon beeindrucken lassen, wie viel man gebaut hat, und vergessen, wie viel man dabei eigentlich gelernt hat.

## Also, bin ich ein Vibe Coder?

Ich glaube, das hängt vom Projekt ab. Wenn du mir bei MIRA zugeschaut hättest, wie ich jede Zeile Code prüfe und die Implementierung verstehen will, hättest du das vermutlich nicht Vibe Coding genannt. Aber bei Teilen meiner Arbeit an PoorUp? Ja, da verstehe ich, warum du das vielleicht tun würdest.

Ich benutze viel KI. Manchmal schreibe ich den Code selbst, manchmal arbeite ich mich sorgfältig durch KI-generierten Code, und manchmal ist mir wichtiger, dass ein Feature funktioniert, als jedes Detail seiner Implementierung zu verstehen. Es bringt wenig, so zu tun, als wäre das anders.

Aber alle in zwei Kategorien zu stecken – *echte Programmierer* und *Vibe Coder* – sagt für mich nicht sonderlich viel aus. Entscheidend ist nicht, ob jemand KI benutzt, sondern was er selbst beiträgt, was er versteht und ob er dabei etwas lernt. Denn **mehr Software zu bauen und ein besserer Programmierer zu werden, sind nicht zwangsläufig dasselbe.**

Bin ich also ein Vibe Coder? Manchmal wahrscheinlich schon.

Bin ich deshalb ein schlechter Programmierer? Glaube ich nicht.

Könnte mich zu viel KI zu einem schlechteren machen? Auf jeden Fall.

Und das möchte ich mir lieber jetzt bewusst machen als erst nach den nächsten zehn Projekten.
