# Poorup

- Original content ID: poorup
- Category: Games & software
- Status: Playable project
- Technologies and topics: Node.js, Express, Socket.IO, JavaScript

## Summary

A multiplayer property game in your browser. You can buy, trade, borrow, build and bankrupt your friends. Making that work with several people connected at once was the interesting part.

## Story

I originally wanted to build a game I could play with my friends. The result was Poorup, a browser-based property game where you can buy, trade, mortgage and eventually bankrupt each other. Somehow, auctions, bots, a fictional stock market and several other systems also found their way in.

From the player's perspective, the rules are quite straightforward: join a room, roll the dice, and try not to run out of money.

But that explanation skips the most interesting part. When several people are playing from different devices, who actually decides what happened? If two browsers disagree about who bought a property, it's not enough for both interfaces to look convincing.

And auctions turned out to be a particularly effective way of exposing that problem.

{{figure:0}}

### Shared game state

A player can click a button to bid or buy something, but the browser is not supposed to make the final decision. It sends an **intent** to the Node.js server, which checks the current turn, the amount of money available and the game rules before changing the shared state.

[Socket.IO](https://socket.io/) handles real-time communication between clients and the server. It makes messages easier to exchange, but it doesn't guarantee that every message arrives instantly or that everyone sees it at the same time.

Imagine one player clicking Buy while another player's screen is still showing an older state. If both browsers were allowed to decide the outcome themselves, they could end up displaying two different owners for the same property. That's a pretty bad feature for a property game.

So the server is **authoritative**: it validates the action, updates the room and broadcasts the result. That prevents a whole category of client-side inconsistencies, although it certainly doesn't mean the game is immune to every exploit.

{{figure:1}}

Now, buying a property is one action. Auctions are different. They mix several players, changing bids and a deadline that everyone is watching. Which is where a seemingly harmless countdown becomes an engineering problem.

### Not really the countdown

What happens if my phone says there are 80 milliseconds left, your laptop says 140 milliseconds, and both of us press Bid? Both screens could be telling the truth according to their own clocks, yet only one shared outcome is possible.

The easy mistake would be to let each browser decide whether its bid arrived in time. But browser clocks can differ, messages can be delayed, and the code running in a client's browser isn't something the server should blindly trust.

So the auction deadline belongs to the **server**. In the current implementation an auction has a five-second window, bids received at or after the deadline are rejected, and accepted bids extend that deadline. There's also a 300 ms bid cooldown.

That solves the question of *who decides*. It still leaves the UI needing to show something sensible while network messages travel back and forth.

The client uses a server-time offset from synchronized game state to draw a countdown closer to the server's timeline. Here is the relevant part of `clientAuctionUi.js`:

```js title=clientAuctionUi.js
function serverNow() {
  return Date.now() + (state.serverTimeOffset || 0);
}

const remaining = a.deadline - serverNow();
```

That calculation helps the timer look consistent. It doesn't grant the browser authority. If a bid reaches the server too late, a countdown still showing a fraction of a second cannot make the bid valid.

Great, so the server owns the clock. Problem solved?

Only until a player disconnects.

### Disconnects

The awkward scenario I remember is someone leaving while an auction is still active. The server can no longer assume that every participant is connected, but it also can't pretend that a dropped connection was a deliberate decision to pass.

So the code distinguishes disconnected participants from active bidders. It checks eligibility when a bid comes in and again when the winner is determined. If the player who started an auction leaves during the relevant turn, there's a cancellation path as well.

And even with disconnects handled, another question appears: what happens to the money behind the winning bid?

If I'm leading an auction with a bid of $500, I shouldn't be able to spend that same $500 on something else and then still expect to win. The server therefore accounts for cash committed to the leading bid when deciding what the player can spend.

This is why the timer problem wasn't really about drawing five seconds on a screen. It was about deciding what the game should do when two messages arrive almost together, one player vanishes, or someone's visible balance is no longer the amount they can actually use.

The UI has to accept those decisions and recover when its local view is out of date. It cannot simply insist that the optimistic state it displayed a moment ago must be right.

### Then I added more

Once multiplayer actions worked, there was a lot more room to experiment. Poorup now has Standard-40 and Metro-52 boards, public and private rooms, guest play, trading, property development, financing and fictional market events.

I also designed the interface and SVG artwork, then built multiple visual themes. Because apparently implementing all those game rules wasn't enough; I also wanted the board to look different depending on the mood.

{{figure:2}}

The bots added another reliability problem. There's deterministic bot logic and an AI-advisor mode, with a fallback if an external AI provider isn't available. A multiplayer game shouldn't stop just because another service failed to answer.

I also used GPT/Codex for debugging and implementation assistance, particularly with bot behavior and larger backend refactors after code reviews. The interface and SVG artwork are my own work. I'd rather explain which parts had assistance than imply that every line appeared without it.

The important thing is that the extra features all have to operate on the same shared game state. It doesn't matter how nice a new auction animation looks if it breaks the rules everyone else is playing by.

### Not finished yet

A bigger codebase also brings more opportunities for things to go wrong.

The server currently stores accounts and game history in JSON files. That's manageable for the single-process deployment it was designed around, but it makes running several server instances much more complicated. The application guards against that kind of setup without a suitable storage adapter.

There's no strict fixed timer for every turn, either. The game uses inactivity handling and vote-kicking instead. Individual features still need checking, including differences between versions of the Parlor Patrol documentation and the deployed game.

There are automated tests, but a useful test is also getting two people into a real room, watching what happens when their connections don't behave perfectly, and making sure the server still produces one coherent result.

{{figure:3}}

I started Poorup because playing a property game with friends sounded fun. The part I didn't anticipate was how much of the work would be about clocks, ordering, consistency and what happens when a person disappears halfway through a decision.

Then again, if I'm going to let people bankrupt their friends online, I should probably make sure we all agree on who won the auction.

## In numbers

- Boards: 2, Standard-40 and Metro-52
- Visual themes: 6
- Achievements: 48 in the recorded project snapshot
- Game actions: 47 handled in the main game socket module
- Code: approximately 61,000 lines of JavaScript and 39,000 lines of tests in the recorded snapshot
- Tests: 229 test suites in the recorded full run; CI enforces at least 88% line coverage
- Runtime dependencies: Express and Socket.IO
- Architecture: single-process server with JSON persistence; no general multi-instance support
- Auction timing: five-second server-controlled deadline, reset after an accepted bid, with a 300 ms bid cooldown

## Figures

- ![Poorup pixel-art social card with the game title, slogan and a view of the property board.](poorup/social-card.png) Poorup's visual identity.
- ![Poorup multiplayer game screen with a property board, player list, dice actions and game tabs.](poorup/board.png) The shared property board; the server decides the game state.
- ![Poorup start screen in the winter pixel-art theme with buttons to play and join a room.](poorup/theme-winter.png) One of the available visual themes.
- ![Poorup profile history screen showing match records, wins and recent game results.](poorup/profile-history.png) The profile and match-history view.

## Links

- [Source repository: Poorup](https://github.com/jeremy341/Poorup)
- [Live demo: poorup.tech](https://poorup.tech)
