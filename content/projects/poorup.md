# Poorup

- Original content ID: poorup
- Category: Games & software
- Status: Playable project
- Technologies and topics: Node.js, Express, Socket.IO, JavaScript

## Summary

A real-time multiplayer board game that runs in the browser. Everyone sees the same state, the turns can surprise you, and there's a bit of friendly competition.

## Context and motivation

I started Poorup because I wanted to learn how real-time web apps work and how to write game logic on the server. Most of my projects start in the Hack Club community, and this one did too. I also wanted something my friends and I could actually play together. Once it was out, people loved it.

It's a Monopoly-style property game. You roll, buy, trade and try to be the last player who can still pay the rent. You don't download anything or make an account. You open the link, pick a name and share the room code with whoever should sit at the table.

The hard parts are the ones you only notice when they break. What happens if someone's connection drops in the middle of an auction? What if two players try to buy the same property in the same second? What if a player just leaves? I spent most of my time on those questions, and they taught me most of what I got out of this project.

## Inside the project

The server owns the game. The browser only sends what the player wants to do, such as roll, buy, bid or accept a trade, over Socket.IO. The server checks each action against the rules and sends back the new state. That's why a modified browser can't cheat: it never decides anything. The server runs on Node.js and Express. The client is plain HTML, CSS and JavaScript with no framework, so the only two runtime dependencies are `express` and `socket.io`.

### What is in the game

- There are two boards, Standard-40 and Metro-52. Both are described as data, not as two separate rule sets.
- Rooms can be public or private with a code. There's guest entry, chat, reconnecting after a drop, removal of inactive players and a vote-kick.
- Property play covers buying, charging rent, building evenly across a colour group, mortgages, auctions and trades.
- Money between players goes beyond the basics: trade and financing offers outside your own turn, bank loans, loans between players with collateral and default rules, and sponsored purchases, where one player pays for another's property in return for an agreed share.
- There's an optional stock market in fictional currency with shared prices. Global events move the market, and sometimes they even change the rules for a round. An optional casino, also in fictional currency, is there too.
- There are bots in two modes. The first is a deterministic bot called House Brain. The second is an AI advisor that only ranks moves the rules engine already considers legal. If its provider fails or takes longer than four seconds, House Brain plays the move instead.
- Profiles keep match history, achievements, friends and rankings.
- Six theme worlds with pixel-art SVG artwork, plus an optional music player.

### Behind the screen

The server is split by job. Auctions, trades, rent, cards, bankruptcy, airports, the economy and sponsored purchases each have their own module, and the rules sit in separate files. That way a change to one rule doesn't ripple through everything else. Every socket event goes through a rate limiter and an origin allow-list before anything happens.

There's no database. Accounts, matches and social records are JSON files, with checksummed backups. A health endpoint and a drain mode make it possible to deploy a new version without cutting off a game in progress.

### How I built it

I designed and wrote the whole interface, and I drew all of the SVG artwork myself. GPT/Codex helped with debugging and the backend, and it did most of the work on the in-game bots. A code-health tool flagged some of my biggest files as hotspots, so I used Codex to split them into smaller modules.

The music isn't mine. It's third-party and openly licensed, and the credits are in the repository. I also rewrote the Git history on purpose, so the commit log isn't a full record of how the project developed.

## In numbers

- Boards: 2, Standard-40 with 40 tiles and Metro-52 with 52 tiles
- Themes: 6, with 12 openly licensed music tracks
- Achievements: 48
- Game actions: 47 handled by the main game socket module
- Code: about 61,000 lines of JavaScript in the server and client (top-level files only), plus about 39,000 lines of tests
- Tests: 229 test suites in the full run, and CI fails the build below 88% line coverage
- Runtime dependencies: 2 (`express` and `socket.io`)
- Code health: the average source file scored 9.2 out of 10 in a CodeScene review in October 2026

## Figures

- ![Poorup's social card: the pixel-art title, the line Roll. Buy. Trade. Bankrupt your friends., and an angled view of the board.](poorup/social-card.png) The social card.
- ![A Poorup room on the Standard-40 board. The player list is on the left, the dice and the Roll Dice button are in the middle, and the Holdings, Deals and Activity tabs are on the right.](poorup/board.png) A test table on the 40-tile board.
- ![Poorup's start screen in the winter theme: a pixel-art village under a moon, with the Play, Create Room and Join Room buttons.](poorup/theme-winter.png) The start screen in the winter theme.
- ![A Poorup profile page on the History tab, with games, wins and win rate on top and a list of completed rounds, one of them expanded.](poorup/profile-history.png) A profile with its match history.

## Where it stands

A live match is kept in memory, and accounts and records are JSON files. Without a database, Poorup runs as a single process and isn't built to scale out. That's why a guard refuses to start in a multi-instance setup until a real database adapter exists.

A few things are still rough. A minigame called Parlor Patrol is switched off because it doesn't work reliably. There's also no turn timer, so a slow player can hold up a table until inactivity removal or a vote-kick steps in. The source repository is the best guide to what works today. The hosted demo runs separately, which is why it can go down from time to time.

## Links

- [Source repository: Poorup](https://github.com/jeremy341/Poorup)
- [Live demo: poorup.tech](https://poorup.tech)
