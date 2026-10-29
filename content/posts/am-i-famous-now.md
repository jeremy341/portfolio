---
title: "Am I famous now?"
description: "Hugging Face downloads aren't really downloads, and what 7k+ on MIRA does and doesn't mean."
slug: am-i-famous-now
publishedAt: 2026-10-29
tags: [mira, hugging-face]
---

Hi, if you are reading this, it seems like my clickbait worked. So let me explain what I mean. Recently I broke 7k+ all time downloads on [Hugging Face](https://huggingface.co/), impressive right? Well, kinda, but at the same time not. There is one problem: [Hugging Face](https://huggingface.co/) downloads aren't really downloads.

## What actually happened?

Let me provide you with some context first, the project which broke 7k is called [MIRA](/work/mira/), short for Machine intelligence for recycling automation. It started as one simple question: could a cheap camera and a small model tell different kinds of waste apart? I trained the model, put the files on [Hugging Face](https://huggingface.co/), and guess what, it seems like people liked it because the number just went up and upwards. Seeing 7k+ downloads next to the model I named and created felt crazy and to be honest a bit euphoric. It was the first time something I built got actually used by people I have never met and it felt GREAT.

## Now what is the problem?

Well you guys got the context now, but now you could be asking yourself what did I mean under "downloads aren't really downloads"? Well this is also the part I had to look up, but it seems like [Hugging Face](https://huggingface.co/) doesn't count people or clicks. It counts requests to a specific file, which is usually `config.json`. So if one person loads the model five times, that can be five counts, and now imagine my model has essentially 19 versions on its repo. So the stats could be padded, and that isn't really the only problem. If their machine has the file cached, a new run might not count at all. Basically the number says the file got requested, not how many people use the model.

So this is sth worth mentioning, and the 7k aren't the same as 7k people. I would rather have a real number than a small one.

## So am I famous now?

Well, not really, but even then it doesn't change the fact that even if people aren't actively using my model, it seemed to have performed well enough that people see it and request it. Even a few people using it is better than none, and even if all these people are bots, it's still nice to see sth you have built be used or requested from a multitude of origins.

## What's next?

Well, though [MIRA](/work/mira/) is already performing so well, it isn't perfect, and I hadn't gotten to working on it and perfecting it. Recently a bit of time freed up in my schedule, so the next steps are training a new MIRA model which is better than the last. The reason is that it seems like the latest model, EXP-019, is [benchmaxxed](https://en.wikipedia.org/wiki/Overfitting), meaning it was tuned so hard for one test that it looks great there but might not hold up in real use.

Well this is all I wanted to say, and I hope you enjoyed reading this. I hope you all have good luck with your own projects, and if you have time, check out the project I made. In case I don't see ya, good afternoon, good evening, and good night! Bye!
