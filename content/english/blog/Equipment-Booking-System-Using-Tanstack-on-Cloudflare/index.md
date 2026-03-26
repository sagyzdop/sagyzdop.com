---
title: "Equipment Booking System Using Tanstack on Cloudflare"
meta_title: "Equipment Booking System Using Tanstack on Cloudflare"
description: "Recently I got my hands on a project for a student club at my university – NU Image. The task was to develop an equipment booking platform. This post is a changelog of decisions I made on this project."
date: 2026-03-16T12:12:12Z
# image: "images/Monolith_compose.svg"
categories: ["Guide"]
author: "Bakhtiyar Yesbolsyn"
tags: [""]
draft: true
featured: true
---

## The Stack

Biggest and arguably the most expensive decision is the choice of the stack.

I was sure about deploying on Cloudflare's platform, namely – workers, but the code part wasn't that obvious.

Recently I tried Kiro – Amazon's attempt at making their million dollar VSCode fork powered by Claude. What I got from it is the spec-driven approach used by their agent in planning mode.

[EARS (Easy Approach to Requirements Syntax)](https://kiro.dev/docs/specs/feature-specs/#requirements-with-ears-notation) notation provides a structured format for writing clear, testable requirements. In a spec's `requirements.md` file, each requirement follows this pattern:

```
WHEN [condition/event] THE SYSTEM SHALL [expected behavior]
```

I thouht "Great, I can write up the requirements and feed the agent, get it done over a weekend!". How naive was I. I thought collecting requirements would be the easy part. I spent whole week on it. That's when I realized that this was my first time building a real system, used by real people, that solved a real problem.

Good way to start is to not reinvent the wheel and reuse code that is out there. This was a simple CRUD app with calendar integration, surely someone at this point has done it? Right?..

Found Cloudflare's [Astro Saas Admin template](https://www.youtube.com/watch?v=oER3PNpHa40) showcasing things in the ballpark of what I was trying to do. Funny enough, Cloudflare [acquired Astro](https://blog.cloudflare.com/astro-joins-cloudflare/) literally the day before I started this project.


Now, armed with complete set of requirements, Astro template and 500 bonus tokens I tried to one-shot it with Kiro. That surprisingly (not) didn't work, which gave me some peace of mind about AI taking my job. However, I spend way too much time trying to prompt my way through it.

Disappointed in my failed attempt I started looking for a framework. I had some experience with Next.js, so I looked into it. It turns out Vercel – the company that makes Next – is the Apple of the world of web devlopment. In a nutshell, for Next.js to work well – you need to host on Vercel, which I am not doing. Other than that, the framework itself is allegedly is messy. From personal experience, the learning curve is quite steep, and there is a constant feeling "there must have been a better way to do this".

### Tanstack

Meet Tanstack. The framework the cool guys use. Compares itself to Next and claims to be better, and personally, I agree. 





![There is nothing we can do](images/There-is-nothing-we-can-do.jpeg)