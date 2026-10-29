# AbiVault

- Original content ID: abi
- Category: Games & software
- Status: Personal project
- Technologies and topics: [Next.js](https://nextjs.org/), TypeScript, [Supabase](https://supabase.com/)

## Summary

A shared money workspace for school committees and small teams, built so every cent can be traced.

## Context and motivation

In Germany, the graduating class (the "Abi" year) runs its own money. There's a yearbook to pay for, a trip, a party, and all of it comes from sales and member contributions. Usually the committee keeps track in a shared spreadsheet. That works fine until someone asks where a particular 40 euros went.

AbiVault does the same job the way accounting does it. Income and expenses are recorded as proper transactions, receipts get attached, cash registers get counted, and every change leaves a trail. Members can see where the money goes without being able to change it. That's the part a spreadsheet handles badly.

## Inside the project

AbiVault replaces the committee's spreadsheet with an application that takes money seriously. That leads to the main design choice: the books should never end up wrong, even when someone makes a mistake.

### How it works

- Money is stored as whole cents (EUR minor units in a `bigint`), never as floating-point numbers. That way rounding errors can't creep in.
- A transaction is posted through a database function that writes balanced ledger entries, so the books always add up.
- Every row belongs to one organisation, taken from the sign-in token, and Row Level Security in PostgreSQL enforces that. Audit triggers record important changes, and an accounting period can be locked once it's closed.
- Three roles: admin, supervisor and student. Students get a restricted view that shows where the money goes, without letting them change anything.
- Receipts (PDF, JPG or PNG, up to 5 MB) go into a private storage bucket. They're opened through short-lived signed links, and each one has a review state so someone can check it.
- Cash registers with cash counts, savings goals, reports with CSV export, and invite links for new members.
- Three separate layouts for desktop, tablet and phone, rather than one layout squeezed onto every screen. The interface is in German, because that's who uses it.

### The stack

[Next.js](https://nextjs.org/) 16 with the App Router and server actions, React 19 and TypeScript. [Clerk](https://clerk.com/) handles sign-in and organisations, and [Supabase](https://supabase.com/) provides PostgreSQL, Row Level Security and file storage. Zod checks input, Recharts draws the reports and Tailwind 4 does the styling. Vitest runs the unit tests. The row-level security rules get their own SQL test, because that's the part I least wanted to get wrong.

## In numbers

- Code: about 18,800 lines of TypeScript, 16,400 lines of CSS and 4,000 lines of SQL in my working copy
- Database: 19 migrations
- Tests: 16 Vitest files with about 49 test cases, and one SQL test of 306 lines for row-level security; I haven't re-run them for this page
- Roles: 3, and receipts up to 5 MB in 3 file types
- Not built: bank connections

## Figures

- ![AbiVault's overview page in dark mode: key figures, a cash register card, the latest transaction, a goals panel and a receipt waiting for review.](abivault/dashboard.png) The public demo, with sample data.

## Where it stands

Bank connections and Open Banking are deferred and switched off. The public demo runs on seeded sample data in a separate configuration, so it isn't meant for real financial data. It was built from an older branch. My working copy has been redesigned since then. The first version also had a different name, so some parts of the interface still say Abi Manager.

## Links

- [Source repository: abi-vault](https://github.com/jeremy341/abi-vault)
- [Live demo](https://abi-vault-demo.vercel.app)
