---
title: "Am I a Vibe Coder?"
description: "I review AI-assisted projects for Hack Club while using Claude and Codex in my own work. So where does that leave me?"
slug: am-i-a-vibe-coder
publishedAt: 2026-11-16
tags: [ai, programming, hack-club, vibe-coding]
---

I'm an AI believer. An AI connoisseur, Hell you could even call me a fanatic if you wish.

But does that make me a vibe coder? And if it does, does that automatically make me a bad programmer? A bad person, even? Okay, that last one might be a bit dramatic.

Still, it's a question I've been thinking about lately. Because I spend a ridiculous amount of time using AI to work on my projects, yet at the same time, part of my job as a reviewer involves reviewing other people's code and looking for signs of AI usage. A bit ironic, isn't it?

So where exactly do we draw the line? When does AI stop being a tool that helps you build something and start becoming the thing that's actually building it? And more importantly, **which side of that line am I on?**

## First, a little context

For those who don't know, I'm involved with [Hack Club](https://hackclub.com/), a community of teenagers interested in programming, electronics, hardware and pretty much anything you can build.

Hack Club runs programs called [YSWS](https://project.hackclub.com/overview/info/), short for *You Ship, We Ship*. The general idea is that you build and ship something, and in return, you can receive rewards. Pretty cool concept, right?

Well, I also happen to be a reviewer for projects submitted to one of these programs. That means I spend a decent amount of time looking through other people's GitHub repositories, checking what they've built, going through commits and trying to understand how much work actually went into a project. And yes, that sometimes includes looking for AI-generated code.

Which brings us to a slightly uncomfortable situation. I'm sitting here reviewing projects for AI usage while Claude and Codex are probably responsible for writing a significant amount of code in some of my own repositories. Now that's interesting.

## So, am I one of those people?

Before answering that, we probably need to agree on what [vibe coding](https://en.wikipedia.org/wiki/Vibe_coding) actually means. Depending on who you ask, the term seems to describe anything from using AI to help with programming to letting an AI write an entire application while barely looking at the code. And those are two very different things.

First of all, **I can program.** I feel like I should mention that before somebody gets the impression that I spend my entire day writing prompts and watching Claude do everything for me.

I actually enjoy writing code. I do most of my UI work myself, and I usually work inside an [IDE](https://en.wikipedia.org/wiki/Integrated_development_environment), where I can see my files, edit the code and follow what's happening. I'm not just throwing prompts into a terminal and accepting whatever application comes out. Though I suppose that would make my life a lot easier sometimes.

Anyway, the funny thing is that my approach to AI depends heavily on the project. Take [MIRA](/work/mira/), for example. MIRA is a machine learning project I worked on, and during its development, I inspected every line of code. I wanted to understand how everything worked, what the code was doing and why certain decisions were made.

Now compare that to [PoorUp](/work/poorup/). PoorUp is a multiplayer browser game and probably one of my biggest software projects. I spent a considerable amount of time designing the gameplay, deciding which features I wanted and figuring out how everything should interact. But I also relied quite heavily on Claude and Codex, particularly for parts of the backend.

And no, I didn't read every line of code they generated. There. I said it.

I could explain what most features do, how they interact and why they're there. But open a random backend file and ask me to explain every single function? Well, give me a bit of time to read through it first.

And that's what I find interesting. Both MIRA and PoorUp are projects I've spent a lot of time working on, yet my involvement with their code is quite different. Does that make MIRA more *mine* than PoorUp? I wouldn't say so. But it does raise a question about what it actually means to understand something you've built.

## Do I need to understand every line?

Let's take [Egg](https://github.com/jeremy341/egg) as another example. Egg is a deployment platform I'm developing for Hack Club Nest. Basically, I want people to be able to deploy their applications without having to SSH into their servers and manually update everything.

Recently, I was thinking about changing how applications are built. Instead of having every application compile directly on its Nest container, why not use [GitHub Actions](https://docs.github.com/en/actions) to build it first and then send the completed application to Egg? That way, the actual server doesn't have to waste its limited resources compiling a Next.js application or whatever else somebody wants to deploy. Sounds reasonable, right?

Well, then you start thinking about everything else. What if the build fails? What if the application starts but immediately crashes? How should rollback work? What happens to environment variables? And how do you make sure somebody can't just upload a malicious release? Suddenly, something that sounded pretty simple becomes an entire engineering problem.

And that's the part I really enjoy. Researching alternatives, figuring out how the system should behave and understanding why one approach might be better than another.

Could I implement that entire system from scratch without using AI? Probably, with enough time, documentation and a considerable amount of frustration. Would I be able to do it nearly as quickly? Absolutely not.

But I don't think taking longer to implement something makes you a worse programmer. There are plenty of things I haven't learned yet, and that's kind of the whole point of learning, isn't it?

Still, there's an important distinction between understanding how a system is supposed to work and understanding how it has actually been implemented. And when I don't read the code, I can't always be completely certain about that second part. Which is fine until something breaks and I suddenly need to understand what went wrong.

**That's where relying too much on AI can become a problem.**

## Now about reviewing other people's projects...

Remember how I mentioned that I'm a reviewer? Well, here's where things get a little awkward. When reviewing projects, I sometimes come across repositories that seem heavily AI-generated. Maybe it's the comments, the commit history, the code structure or a UI that looks suspiciously familiar.

And yes, **I know a good-looking UI doesn't automatically mean something was made using AI.** Neither does having detailed comments or nicely structured code. Those things might make me look a little closer, but they aren't proof of anything.

The difficult part is figuring out how much effort someone actually put into their project. Imagine two people submitting a game.

One spent hours planning the game, experimenting with ideas, writing code, testing features and using AI to help with the parts they struggled with.

The other typed *"make me a cool game"*, accepted the first result and submitted it without really understanding what they'd received.

Both projects might contain AI-generated code. But are they really the same? I don't think so.

Of course, the rules of the particular YSWS still determine what is allowed. My job isn't to invent my own rules based on whether I like someone's coding style.

The problem is that **AI-generated code doesn't automatically tell you how much human effort went into a project.** And that's much harder to judge than you might think. Because if someone were reviewing PoorUp, they might notice the AI-assisted code and assume I barely knew how to program. They wouldn't necessarily know that I also spent time working on MIRA, where I took a completely different approach, or that I regularly write code myself and make technical decisions throughout development.

Then again, how could they? They don't know me. They only have the evidence I submitted. Which is why I've become a little more careful about treating AI-looking code as proof of anything.

It's funny, really. I spend time trying to figure out how other people use AI, while knowing that someone could probably look through parts of my own repositories and ask exactly the same questions.

But there's another problem I've started noticing while reviewing projects. The AI model someone uses might affect how their work gets judged, even when it doesn't necessarily reflect how much effort they put in. And that's a whole different rabbit hole. Probably one for another blog post.

## Is AI making me a worse programmer?

Now this is something I've genuinely been thinking about. I love computer science. Not just building websites or getting projects to work, but actually understanding how things function. GPUs, machine learning, electronics, operating systems. There's just so much interesting stuff to learn. And I'd say I've learned a considerable amount through my projects, including while using AI.

But there's one thing AI makes ridiculously easy. **Skipping the difficult parts.**

Encountered an error? Ask Claude.

Need to implement some complicated backend logic? Ask Codex.

Don't understand why that one stupid function refuses to work, despite the fact that you've been staring at it for the last hour? Well, just ask AI to fix it.

You get where this is going, right?

And suddenly, something that could've taken me hours is working. Amazing, right? Well, yes. But did I actually learn how to solve the problem? That's where things get a little complicated.

Sometimes I do. I read the explanation, inspect the implementation and come away understanding something new. Other times, I'm more interested in getting the feature working so I can move on to the next thing. And to be honest, I think I've probably done the second one more often than I'd like to admit.

Because there's a difference between **using AI to save time and using AI to avoid learning something.** It's not always obvious which one I'm doing.

Now, I'm not going to pretend I'll stop using AI and start writing every single thing manually. Let's be realistic here. If I've already learned how something works, and AI can save me hours of repetitive work, I don't see why I shouldn't use it. But if I come across something I find genuinely interesting, something I actually want to understand, I don't want to immediately hand it over to Claude just because that would be easier.

I still want to become a better programmer. Not just someone who can build increasingly complicated software with increasingly complicated prompts. And I think that's something I need to remind myself of every once in a while. Because it's pretty easy to get distracted by how much you've built and forget to ask how much you've actually learned.

## So, am I a vibe coder?

Well, I think I'm somewhere on that *gray line*. If you watched me working on MIRA, inspecting every line of code and trying to understand the implementation, you probably wouldn't call that vibe coding. But if you looked at some of my work on PoorUp? Yeah, I can see why you might.

I use AI extensively. Sometimes I write the code myself, sometimes I work through AI-generated code carefully, and sometimes I'm more focused on whether a feature works than on understanding every detail of its implementation. I don't think there's much point pretending otherwise.

But I also don't think putting everyone into two categories, *real programmers* and *vibe coders*, tells us very much. For me, the important thing isn't whether someone uses AI. It's what they contribute, what they understand and whether they're actually learning anything along the way. Because **building more software and becoming a better programmer aren't necessarily the same thing.**

So, am I a vibe coder? Sometimes, probably.

Does that make me a bad programmer? I don't think so.

But could relying on AI too much make me a worse one? Definitely.

And that's something I'd rather be aware of now than realize after building another ten projects.

Still an AI believer, by the way. Still a connoisseur. Fanatic, if you insist. Just one who doesn't want to forget how to program while getting better at telling AI to do it.

In case I don't see ya, good afternoon, good evening, and good night! Bye!
