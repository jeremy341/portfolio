# Poorup

- Original content ID: poorup
- Category: Games & software
- Status: Playable project
- Technologies and topics: Node.js, Express, Socket.IO, JavaScript

## Summary

A multiplayer property game in your browser. You can buy, trade, borrow, build and bankrupt your friends. Making that work with several people connected at once was the interesting part.

## Story

I wanted to build a game I could play with friends. Somehow that turned into Poorup: a multiplayer property game with auctions, trades, mortgages, bots, a fictional stock market, and a lot more financial decisions than I originally expected.

You open the website, join a room, roll the dice and try not to go broke. Simple enough to explain. Not always simple to implement.

Because when several browsers are connected to the same game, the really fun question is: **who gets to decide what happened?**

{{figure:0}}

### One room, several players, one version of the truth

Poorup runs in the browser, but the browser doesn't own the game's rules. It sends an *intent*: roll the dice, place a bid, buy a property, accept a trade. The Node.js server checks whether the action is allowed and updates the room's authoritative game state.

[Socket.IO](https://socket.io/) keeps clients synchronized. It makes real-time messages easier to send, but it does not make distributed systems problems disappear. Two users can click at almost the same time. A request can be delayed. A connection can vanish halfway through a decision.

If each browser decided what the state was, you'd eventually have two people convinced they'd bought the same property. Not ideal.

So the server validates actions, checks the current turn and available money, then broadcasts the resulting state. That's an important layer of protection, though it doesn't mean the game is somehow immune to every possible exploit.

{{figure:1}}

### Auctions were where things got annoying

Here's a scenario that caused me trouble: an auction is running, someone places a bid near the end, and another player disconnects. Whose clock matters? What if two bids reach the server in the same second? What if the browser is showing a timer that's a little behind?

A countdown sounds like a tiny UI feature until money and game state depend on it.

The first thing I had to accept was that the **server clock must decide whether a bid is on time**. A phone's countdown is just a display. Browsers have different local clocks and network delays, and users can change the code running in their own browser.

The server currently gives an auction a five-second window, rejects bids arriving at or after its deadline, and applies a short 300 ms bid cooldown. An accepted bid updates the leading bidder and moves the deadline forward.

The client gets a server-time offset from the synchronized game state and uses it to draw the countdown. The actual client code includes this:

```js
function serverNow() {
  return Date.now() + (state.serverTimeOffset || 0);
}

const remaining = a.deadline - serverNow();
```

That helps the displayed timer stay aligned with the server's timeline, but it still isn't the source of truth. The server decides whether a bid counts and when the auction ends.

There's a second problem: **disconnects**. A player who leaves during an auction isn't the same as a player who voluntarily passes. The code accounts for disconnected seats when accepting bids and checking the eventual winner. If the player who opened an auction leaves during the relevant turn, the server also has a cancellation path.

That doesn't make networking predictable. It means the game has rules for handling some of the ways networking is unpredictable.

### Why I cared about timing more than the pretty countdown

If two bids are submitted almost simultaneously, the server receives and processes them in an order. It checks that a new bid is higher than the current one, that the player can afford it, and that the deadline hasn't passed.

That may mean one browser briefly shows a state that's already out of date. The UI needs to recover when the authoritative update arrives, not stubbornly insist its optimistic guess was correct.

I also had to think about things such as committing cash to a leading bid: somebody shouldn't be able to promise money in an auction and spend that same money elsewhere before the auction closes.

The difficult part wasn't drawing five seconds on screen. It was deciding what the game should do when real people and real networks don't behave perfectly.

### The game got a little out of hand

Poorup has two boards, Standard-40 and Metro-52. There's guest play, private rooms, reconnect support, property development, financing, fictional stock-market events and an optional casino using in-game money.

I designed the UI and made the SVG artwork. I also ended up building several visual themes because apparently one theme wasn't enough.

{{figure:2}}

There are deterministic bots and an AI-advisor mode too. The deterministic bot can step in if an AI provider fails, which matters because the game shouldn't freeze just because an external service is unavailable.

A lot of the backend grew beyond what I'd originally written by hand. I used GPT/Codex for debugging and implementation help, especially for bots and refactoring larger backend files after code-health reviews. The interface and SVG designs are my work. I think that distinction matters more than pretending everything was written one keystroke at a time.

### What I would still fix

Not every feature is polished, and a large codebase doesn't automatically mean a well-engineered one.

Poorup persists account and game records in JSON files rather than a database. That's convenient for a single-process deployment, but it makes horizontal scaling much harder. The application explicitly guards against starting a multi-instance setup without a proper storage adapter.

Turns don't have a fixed time limit, so the system relies on inactivity handling and vote-kicking rather than a strict per-turn deadline.

And yes, there are still individual features and edge cases that need more attention. For example, the public code and product documentation have described the Parlor Patrol minigame differently across versions; I'd want to verify the deployed behavior before advertising it as universally available.

The source code has automated tests, but the best way to understand the product is still to get two people into a room and play an actual game.

{{figure:3}}

I originally wanted to make something fun for my friends. I ended up learning considerably more about real-time systems, consistency and network timing than I expected.

Also, being able to bankrupt your friends in a browser is still pretty funny.

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
