# AbiVault

- Original content ID: abi
- Category: Games & software
- Status: Personal project
- Technologies and topics: Next.js, TypeScript, Supabase

## Summary

A financial workspace for school graduating committees. I wanted a way to track class money that doesn't depend entirely on trusting whoever has access to one spreadsheet.

## Story

Over the years, I've heard a surprising number of stories about graduating classes collecting money for their Abi celebrations and then struggling to explain where it all went. Sometimes it sounded like poor bookkeeping. Sometimes people suspected that money had been spent without permission.

I can't verify those stories, and I'm not accusing anyone at my own school. But they left me wondering why a committee handling money from dozens of students might still depend on a spreadsheet that only a handful of people can really inspect.

A spreadsheet can tell you what someone *typed*. It doesn't necessarily tell you who made a change, whether the amount was correct or what happened to the money afterward.

That's the problem I wanted AbiVault to address.

{{figure:0}}

### Let's say €40 is missing

Imagine a student asks a fairly reasonable question: "Where did those €40 go?"

If the only answer is a spreadsheet row labeled "decorations", what have we actually learned? We know somebody entered an expense. We may not know who approved it, whether there's a receipt, or if the value was edited after the fact.

So instead of starting with a pretty dashboard, I wanted to start with the evidence needed to answer that question. A transaction should have a recorded amount and purpose. It should fit into a consistent account balance. The people allowed to change it should be identifiable, and important changes should leave a trail.

None of this guarantees that people will be honest. But if something goes wrong, having records you can follow is much better than hoping everybody remembers what happened.

There's a technical detail hidden even in the first requirement, though: what does it mean to record an amount *correctly*?

### You can't audit a number that was stored badly

Computers often represent numbers with floating-point arithmetic. That's useful for many calculations, but binary floating-point formats cannot represent every decimal fraction exactly.

For a graphics experiment, a tiny rounding difference might not matter. In an accounting ledger, I don't want avoidable numerical quirks appearing in the first place.

So AbiVault stores amounts as **integer cents**, using `bigint` where needed. €40.10 is represented as 4010 cents, not as an approximate floating-point value.

That solves the representation problem. But consider our missing €40 again. Even a perfectly stored number doesn't explain where it went if the only data is an editable field called "balance".

That's why the system uses a **ledger** and balanced transactions. With double-entry bookkeeping, a posted movement has matching debit and credit sides. The entries form an accounting record that can be traced rather than a single total that can be overwritten.

The ledger can ensure internal consistency. It cannot prove that a purchase was legitimate or that a receipt is genuine. Which leads to the next problem: who is allowed to enter, approve or change these records?

### The wrong person shouldn't be able to rewrite the answer

AbiVault has admin, supervisor and student roles. Students can inspect a restricted view of the finances, while the people responsible for managing the committee get permissions appropriate to their roles.

I use [Clerk](https://clerk.com/) for authentication and organizations, with [Supabase](https://supabase.com/) and PostgreSQL storing the financial data. One of the more important pieces is **Row Level Security (RLS)**.

RLS means the database itself applies rules about which rows a request can access. If a student from one committee changes an ID in a browser request, that should not suddenly give them another committee's transaction history.

And this cannot be solved by hiding an Edit button. Browser interfaces are under the user's control; authorization has to be enforced behind them.

But access control only answers who can do something *now*. Suppose someone was authorized to make a change yesterday. Can we still understand what was changed next month?

Important actions therefore create audit records, and accounting periods can be locked once they're closed. Those controls help preserve the history behind the balance instead of letting a later edit silently replace it.

### The receipt is where the story becomes real

Back to the €40. We can now store the amount accurately, link it to a balanced transaction and control who is allowed to edit it.

But if the committee bought decorations, somebody should still be able to show *which* decorations. Otherwise the software is just very good at recording an unsupported claim.

AbiVault supports receipt images and PDFs, review states, cash-register counts, savings goals and CSV reports. Receipts stay in private storage and are accessed through short-lived signed links instead of public file URLs.

The interface is in German, because it's intended for German graduating committees, and it has layouts for desktop, tablet and mobile. Being able to check a transaction from a phone matters when the people managing the money aren't always sitting at a desk.

{{figure:1}}

That screenshot is the **demo dashboard**, with seeded example data. It demonstrates the interface and the way records are presented; it is not a screenshot of a real graduating class's finances.

And that distinction matters, because a working-looking dashboard is not the same as a financial system that has been tested in a real organization.

### A demo is not a security audit

The project contains unit tests and a separate SQL test for its Row Level Security policies. Those checks are particularly relevant when organization boundaries and permissions are part of the design.

Still, tests in a repository aren't an independent security review. I haven't validated AbiVault with real committee finances or completed the operational work I'd want before anybody relied on it for their money.

There's no bank integration or Open Banking connection, either. If the project were to move beyond a controlled demo, I'd want stronger backup and recovery procedures, threat modeling, independent review and actual usability testing with committees.

So I'm not claiming that AbiVault has solved the problem of trust. Technology can't do that by itself.

What I wanted was a system where the answer to "Where did those €40 go?" could be built from evidence: a precise amount, a transaction, an authorized action, an audit history and a receipt.

If a graduating class can follow that trail without needing to take one person's word for it, then the project is doing something useful. And ideally, nobody has to turn an Abi committee meeting into a detective investigation just to find out what happened to €40.

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
