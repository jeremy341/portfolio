---
title: "Beyond the Download Count: Understanding MIRA's 8.3k Downloads"
description: "What MIRA's 8.3k Hugging Face downloads actually measure, what the milestone means to me, and what comes next."
slug: beyond-the-download-count
publishedAt: 2026-10-29
tags: [mira, hugging-face]
---

Recently, one of my machine learning projects reached 8.3k all-time downloads on [Hugging Face](https://huggingface.co/). It's a milestone I'm quite happy about, but there's something worth understanding about how Hugging Face actually counts downloads.

## A little context

The project that reached this milestone is called [MIRA](/work/mira/), short for Machine Intelligence for Recycling Automation. It started with a relatively simple question: could a cheap camera and a small machine learning model tell different kinds of waste apart?

I trained the model, published the files on Hugging Face, and over time, the download count kept increasing.

Seeing 8.3k downloads next to a model I had developed myself was a pretty great feeling. It was the first time I'd seen this much interest in something I built from people I had never met.

But I also wanted to understand what that number actually represented.

## How Hugging Face counts downloads

This is something I had to look up myself. [Hugging Face](https://huggingface.co/) doesn't count individual users or clicks on a download button. Instead, it counts requests to certain files associated with a model, which can include [`config.json`](https://huggingface.co/docs/hub/models-download-stats).

If one person loads the model five times, that could potentially count as five downloads. MIRA also has around 19 versions in its repository, which makes it even harder to determine how many individual people are behind those requests.

On the other hand, if someone already has the necessary files cached locally, another run might not register as a download at all.

Basically, the number tells me how often certain files were requested. It doesn't tell me how many people actually use the model.

**8.3k downloads aren't the same as 8.3k users.** It's an important distinction, especially when using download statistics to measure how widely a model is being used.

## What this milestone means to me

Even if I don't know exactly how many people use MIRA, it's still pretty cool to see something I built receiving that many requests.

Some of those requests might come from automated systems, and others might come from people experimenting with different versions of the model. I have no reliable way of knowing.

But whether it's a handful of people or considerably more, the possibility that someone found something I built useful is something I'm happy about.

## What's next for MIRA?

Although [MIRA](/work/mira/) has achieved promising results, there's still quite a bit of work to be done. I hadn't had much time to continue working on it recently, but now that some time has freed up in my schedule, I'd like to start training a new version.

One of my concerns is that the latest model, EXP-019, might be what you'd call *benchmaxxed*. In other words, it may have been optimized too heavily for a particular benchmark, making its reported performance look better than its performance in real-world conditions.

For the next version, I want to focus more on how well the model generalizes to data it hasn't encountered before, rather than simply trying to achieve a better benchmark score.

Ultimately, I'd much rather have a model that performs reliably outside its testing environment than one that achieves impressive numbers on a particular benchmark.
