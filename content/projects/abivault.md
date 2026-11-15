# AbiVault

- Original content ID: abi
- Category: Games & software
- Status: Personal project
- Technologies and topics: Next.js, TypeScript, Supabase

## Summary

A financial workspace for school graduating committees. I wanted a way to track class money that doesn't depend entirely on trusting whoever has access to one spreadsheet.

## Story

Over the years I've heard too many stories about graduating classes collecting money for their Abi events and then having trouble accounting for where it went. Sometimes the stories are about mistakes. Sometimes they're about someone allegedly spending money that wasn't theirs.

I can't verify every story I've heard, and I'm not accusing anyone at my school. But they made me wonder: why is money collected from dozens of students so often managed in a spreadsheet that a few people can edit?

So I wanted to build something more transparent. That's where AbiVault came from.

The idea is pretty simple: if a committee collects money for a yearbook, party or trip, members should be able to understand where it went. And the people handling it should have tools that make both accidental mistakes and unauthorized changes harder.

{{figure:0}}

### The €40 question

Imagine a committee member asks: "Where did those €40 go?"

In a spreadsheet, you might find a row saying "decorations", but not know who entered it, whether there's a receipt, or if someone later changed the amount.

I wanted to make that kind of question answerable from the system itself. Every important movement of money should have a record, a reason and an audit trail.

Of course, software can't make someone honest. It can make the records easier to inspect and much harder to quietly change without a trace.

### Why I didn't store money as normal decimal numbers

This is one of those details that seems tiny until it bites you.

Computers commonly represent decimal-looking values with floating-point numbers. Many decimal fractions can't be represented exactly in binary floating point. If you're building a game, a tiny difference usually doesn't matter. If you're recording a committee's money, I'd rather avoid that entire category of problem.

AbiVault stores monetary values in **whole cents** as integers, using \`bigint\` where appropriate. So €40.10 becomes 4010 cents, rather than relying on a floating-point approximation.

Then there is the accounting model itself. Instead of a single editable number called "balance", the application records transactions through a ledger. A posted transaction writes balanced entries so that money movements can be traced consistently.

The rule behind double-entry bookkeeping is that each transaction has matching debit and credit sides. It doesn't mean a transaction must be *correct in the real world*, but it prevents the ledger from becoming internally inconsistent in a lot of common ways.

### Who gets to see and edit the money?

This is where the project becomes more than a prettier spreadsheet.

AbiVault has three roles: admin, supervisor and student. Students get a restricted view of the finances. People responsible for managing the account can perform the actions their role allows.

The app uses [Clerk](https://clerk.com/) for authentication and organizations and [Supabase](https://supabase.com/) with PostgreSQL for its data. **Row Level Security (RLS)** is a database feature that checks whether a query is allowed to access a particular row. The rules tie records to the user's organization, so one committee shouldn't be able to read another committee's entries just by changing a request.

That distinction matters. Hiding a button in the interface isn't security. A user can inspect browser requests. Authorization has to be enforced on the backend or in the database itself.

Important changes also get audit records, and accounting periods can be locked after they've been closed. Once a period is closed, it shouldn't be possible to casually rewrite last month's finances.

### Receipts, cash and the things spreadsheets forget

A proper financial record needs more than an amount and a date. People want to know what was bought, who approved it and whether the receipt exists.

AbiVault supports attaching receipt images or PDFs, tracking review states, cash-register counts, savings goals and CSV reports. Receipts are stored privately and accessed using short-lived signed links rather than leaving public URLs lying around.

The interface is in German because it's intended for German school committees. I also built distinct layouts for desktop, tablet and phone instead of assuming a wide finance table would somehow become usable on a tiny touchscreen.

{{figure:1}}

That's the demo dashboard. It uses **sample data**, not a real graduating class's private financial records. The distinction is important: a screenshot of a convincing dashboard isn't evidence that the entire system is ready to hold real student money.

### What I'm actually confident about, and what I'm not

The repository includes unit tests and a separate SQL test for the Row Level Security rules. That's good, because the access rules are exactly the part I'd least want to get wrong.

But I haven't independently rerun every test specifically for this page, and I wouldn't treat the existence of tests as an external security audit.

There's also no bank integration or Open Banking connection. Those are deliberately left out. And the public demo is isolated from real data; it should not be used as a live financial system just because the interface looks finished.

If I were to take AbiVault toward real use, I'd put much more effort into operational security, backups and recovery procedures, threat modeling, user testing and independent review.

### What I wanted to build

The thing I care about most isn't how many database migrations it has. It's the idea that students should be able to trust the process around money they've contributed.

That doesn't happen just because an app exists. But thoughtful permissions, traceable transactions and good records are a pretty decent place to start.

And if nobody ever has to ask where their committee's €40 mysteriously disappeared, that would be nice too.

## In numbers

- Tech stack: Next.js 16, React 19, TypeScript, Clerk, Supabase/PostgreSQL
- Security model: organization-scoped Row Level Security, audit triggers, three roles
- Money representation: integer cents using bigint, balanced ledger entries
- Receipts: private storage, signed links, PDFs/JPGs/PNGs up to 5 MB
- Database migrations: 19 in the recorded project snapshot
- Code snapshot: approximately 18,800 TypeScript lines, 16,400 CSS lines and 4,000 SQL lines
- Tests recorded: 16 Vitest files, approximately 49 tests, and separate SQL RLS test
- Demo: seeded sample data only; not production financial data
- Not implemented: bank connections / Open Banking

## Figures

- ![AbiVault demo landing page introducing the class finance workspace.](abivault/home.jpg) The public demo landing page.
- ![AbiVault light-theme dashboard with a sample balance, recent transactions and savings goals.](abivault/dashboard.jpg) Demo dashboard showing seeded example records, not real committee finances.

## Links

- [Source repository: abi-vault](https://github.com/jeremy341/abi-vault)
- [Live demo](https://abi-vault-demo.vercel.app)
