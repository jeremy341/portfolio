---
title: "Am I famous now?"
description: "Hugging Face downloads aren't really downloads, and what 8.3k+ on MIRA does and doesn't mean."
slug: am-i-famous-now
publishedAt: 2026-10-29
tags: [mira, hugging-face]
---

Hi, if you are reading this, it seems like my clickbait worked. Recently, I broke 8.3k+ all-time downloads on [Hugging Face](https://huggingface.co/). Impressive, right? Well, kinda. There's one problem: Hugging Face downloads aren't quite what they sound like.

## What actually happened?

Let me provide you with some context first, the project which broke 8.3k is called [MIRA](/work/mira/), short for Machine intelligence for recycling automation. It started as one simple question: could a cheap camera and a small model tell different kinds of waste apart? I trained the model, put the files on [Hugging Face](https://huggingface.co/), and guess what, it seems like people liked it because the number just went up and upwards. Seeing 8.3k+ downloads next to the model I named and created felt crazy and to be honest a bit euphoric. It was the first time something I built got actually used by people I have never met and it felt GREAT.

## Now what is the problem?

So what did I mean by "downloads aren't really downloads"? This is the part I had to look up, but it seems like [Hugging Face](https://huggingface.co/) doesn't count people or clicks. It counts requests to a specific file, which is usually [`config.json`](https://huggingface.co/docs/hub/models-download-stats).

So if one person loads the model five times, that can be five counts, and now imagine my model has essentially 19 versions on its repo. The stats could be padded, and that isn't the only problem. If their machine has the file cached, a new run might not count at all.

Basically, the number tells me that a file was requested. It doesn't tell me how many people use the model.

So yeah, 8.3k downloads aren't the same as 8.3k people. Still cool, but worth mentioning.

## So am I famous now?

Well, not really. But even if the number doesn't tell me exactly how many people use MIRA, it's still cool to see something I built being requested from different places.

And even if some of those requests are bots, a few real people using it is better than none.

## What's next?

Well, though [MIRA](/work/mira/) is already performing so well, it isn't perfect, and I hadn't gotten to working on it and perfecting it. Recently a bit of time freed up in my schedule, so the next steps are training a new MIRA model which is better than the last. The reason is that it seems like the latest model, EXP-019, is [benchmaxxed](https://en.wikipedia.org/wiki/Overfitting), meaning it was tuned so hard for one test that it looks great there but might not hold up in real use.

Well this is all I wanted to say, and I hope you enjoyed reading this. I hope you all have good luck with your own projects, and if you have time, check out the project I made. In case I don't see ya, good afternoon, good evening, and good night! Bye!
