# PLINTH Parent Portal

The parent-facing front door for PLINTH HDI. Parents give verifiable consent, fill the parent form, and send ready-made links to their child and one teacher. Every submission lands in a private admin queue as a paste-ready intake for **PLINTH Studio**. The portal does **not** generate or show reports: Akash generates, reviews and signs off every dossier in Studio, then sends it to the family.

English and Hindi. No payments. Built with Next.js 16 and Postgres, hosted on Vercel (Mumbai region).

## What it does

| Who | Where | What happens |
| --- | --- | --- |
| Parent | `/start` | Gives their own and the child's details, ticks five consent points, gets a 6-digit email code |
| Parent | `/verify` → `/case` | Code verifies the email and records consent; the profile page shows the three forms and their status |
| Parent | `/case/parent-form` | 12 questions, editable until PLINTH sets the case to *In Studio* |
| Child | `/s/<link>` | Assent screen, then 12 reflection questions; any can be skipped; one use only |
| Teacher | `/t/<link>` | Role, six quick ratings, five written answers, own-observation declaration; one use only |
| Parent | `/login` | Returning parents sign in with an email code |
| Parent | `/case` → Withdraw | Deletes every answer at once; keeps only the record that consent was given and withdrawn |
| Akash | `/admin` | Queue of profiles with source status; per case: details, source-integrity warning, **Copy intake** / **Download .txt** for Studio, status, erase |

**Source integrity.** If the teacher's text repeats the parent's (word-phrase overlap ≥ 25% warns, ≥ 60% flags as duplicate), the admin page and the exported intake both say so, matching the Studio rule.

**Privacy by design.** Names, contact details, answers and links are encrypted (AES-256-GCM) before they reach the database; emails and links are looked up by keyed hash. The database holds no readable personal data. Pages are marked `noindex`.

## Deploying on Vercel

### 1. Create the database (Mumbai)

Use **Supabase** (free tier is enough to start):

1. supabase.com → New project → **Region: South Asia (Mumbai)**.
2. Project → **Connect** → copy the **Transaction pooler** connection string (port 6543). Put your database password into it.

Any Postgres works (Neon via the Vercel Marketplace also does), but choose a region in or near India. The tables are created automatically on first use.

### 2. Set up email (Resend)

1. resend.com → add and verify a sending domain (for example `plinthnetwork.in`).
2. Create an API key.

### 3. Import the repository

1. vercel.com → **Add New → Project** → import `akashowg/plinth-parent-portal`.
2. Framework is detected as Next.js. Leave build settings as they are.
3. Before deploying, add the environment variables below, then **Deploy**.

### 4. Environment variables

Run `npm run gen:secrets` (or ask Claude) to generate the two random keys.

| Name | Value |
| --- | --- |
| `DATABASE_URL` | The Supabase transaction-pooler string from step 1 |
| `DATA_ENCRYPTION_KEY` | 32-byte key from `gen:secrets`. **Also save it in your password manager: if it is lost, stored answers cannot be read.** |
| `SESSION_SECRET` | Long random string from `gen:secrets` |
| `ADMIN_PASSWORD` | A long password only you know, for `/admin` |
| `RESEND_API_KEY` | From step 2 |
| `EMAIL_FROM` | e.g. `PLINTH <care@plinthnetwork.in>` (must be on the verified domain) |
| `CONTACT_EMAIL` | The address shown in the privacy notice for questions and grievances |
| `PUBLIC_BASE_URL` | The site address, e.g. `https://parents.plinthnetwork.in` (used in the child and teacher links) |
| `ADMIN_EMAIL` | *Optional.* Where new-profile and form-received alerts go. Alerts never contain answers |

Never set `DEV_SHOW_CODES` on Vercel.

### 5. Custom domain (optional)

Vercel → Project → Settings → Domains → add e.g. `parents.plinthnetwork.in`, follow the DNS instructions, then update `PUBLIC_BASE_URL` and redeploy.

### 6. First check after deploying

Open `/admin`, sign in, and confirm there is no "Settings not configured" warning. Then run one test profile end to end with your own email, and erase it from the admin page.

## Using it day to day

1. Send parents the site address.
2. When a case shows **Ready for Studio** (all three sources in), open it in `/admin`, click **Copy intake**, paste into Studio → Analyse, choose the report type and run.
3. Set the case to **In Studio**. This locks the forms so the intake you analysed cannot change underneath you.
4. After sign-off, send the dossier to the parent and set the case to **Delivered**.
5. If a parent withdraws, the portal deletes their answers automatically and emails `ADMIN_EMAIL`. Delete the matching Studio copy too.

## Changing the questions

All questions, in both languages, live in `lib/questions.ts`. Edit the wording, then change `QUESTION_SET_VERSION`. Each submission stores the version it was answered under, and the Studio export prints the question beside every answer. Interface text lives in `lib/i18n.ts`.

## Before launch — needs a decision or a review

- **Question sets are a draft.** They were written to cover what the Studio fact sheet extracts, because the Zoho form's exact questions were not available. Approve or replace them.
- **Hindi text** should be read by a native speaker.
- **Legal review.** The consent points, privacy notice (`app/privacy/page.tsx`), 30-day erasure promise and the email-code method of verifying a parent need a lawyer's check against the DPDP Rules before children's data obligations apply (14 May 2027).
- **Back-ups.** Turn on Supabase backups (point-in-time recovery on a paid plan) and keep the encryption key safe.

## Local development

```bash
npm install
cp .env.example .env.local   # fill in values; DEV_SHOW_CODES=1 shows email codes on screen
npm run dev
```
