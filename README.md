# PLINTH Parent Portal

The parent-facing front door for PLINTH HDI. Parents give verifiable consent, fill the parent form, and send ready-made links to their child and one teacher. Every submission lands in a private admin queue as a paste-ready intake for **PLINTH Studio**. The portal does **not** generate or show reports: Akash generates, reviews and signs off every dossier in Studio, then sends it to the family.

Eleven languages — English, Hindi, Bengali, Marathi, Telugu, Tamil, Gujarati, Urdu (right-to-left), Kannada, Odia and Malayalam (India's ten most spoken, Census 2011, plus English). No payments. Built with Next.js 16 and Postgres, hosted on Vercel (Mumbai region).

## What it does

The portal collects the three HDI sources using **Instrument v2.0** (from *HDI Instrument Architecture v2.0*): three age bands, three independent forms, nine answer-quality checks, safeguarding routing and a signal ledger.

| Who | Where | What happens |
| --- | --- | --- |
| Parent | `/start` | Gives their own and the child's details (ages 6–18 only), ticks six consent points including safeguarding, gets a 6-digit email code. The **band** is set from date of birth, never class: A 6–10, B 11–14, C 15–18 |
| Parent | `/case/parent-form` | ~48 described-behaviour items in 10 parts (57 in Band A): how much of the child they see, learning, feelings, character, friends, home, sleep and screens, change, then hopes (locked once passed). Submitted once |
| Child, Bands B/C | `/s/<link>` | Assent, then 10–11 parts: subject grid (enjoyment × ease), learning, thinking scenarios, motivation, feelings, people, character, direction, wellbeing, home, and the interest grid from age 12. ~20 min. Must be done with nobody watching |
| Child, Band A | `/s/<link>` | Opened by a trained adult who is **not a parent** (Akash or a school counsellor), read aloud one-to-one, 29 items on a 3-point scale |
| Teacher | `/t/<link>` | Identity, tenure and class size, 20 observed-behaviour items (29 in Band A), trajectory, and a required "moment that surprised you" |
| Akash | `/admin` | Queue with band and open-safeguarding badges; per case: safeguarding panel, validity flags, **signal ledger**, derived signals, reviewer sign-off, Studio export, reopen a form, erase |

Answers save as respondents go. Parent and teacher drafts resume only on the device that saved them. A **child's draft is sealed with a 4-digit code the child chooses**: reopening the link — on the parent's phone or anywhere — shows only an unlock screen, five wrong codes delete the draft, and the page locks itself after two minutes idle or thirty seconds in the background.

**Signal ledger.** Each of 28 constructs gets a 1–5 value per source (a source needs ≥ 2 answered items), a verdict (convergent ≤ 1.0 apart, divergent ≥ 1.5, partial between), a confidence tier, and engine permissions. Divergent sources are never averaged; they produce a contradiction token. Validity flags can only lower confidence.

**Validity checks.** Attention checks, consistency pairs, implausible-virtue items, straightlining (invalidates the section), section timing, reverse-coding, parent visibility weighting, teacher tenure/class-size weighting, cross-source divergence, plus "someone was watching" for the child form.

**Safeguarding (flag, do not screen).** SG-1 child rarely feels okay · SG-2 no adult at school to go to · SG-3 sleep under 5 h or a marked mood/energy change · **SG-4U** written words suggesting possible current harm (self-harm, abuse, neglect, exploitation, forced marriage) — same-day, URGENT email with 112 / 1098 / Tele-MANAS 14416 guidance · SG-4 distress, bullying, fear of home, substances · RV a reviewer-only note. The lexicon (`lib/instrument/lexicon.ts`, tested by `npx tsx tests/lexicon.test.ts`) covers English, Hinglish and Hindi plus native-script stems in the nine other portal languages, across ten categories — every answer is scanned in every language, whatever the interface is set to — shows context (negation, someone else, a story, the past) without ever silencing a match, and can be extended without a deploy at **/admin/safeguarding**, which also counts real alerts versus false alarms per category. Each trigger emails the named contact (`SAFEGUARDING_EMAIL`, else `ADMIN_EMAIL`, else `CONTACT_EMAIL`) with codes only, and **locks the Studio export** until it is actioned with a note. Matched text never enters the export.

**Source integrity.** If the teacher's text repeats the parent's (word-phrase overlap ≥ 25% warns, ≥ 60% flags as duplicate), the admin page and the exported intake both say so, matching the Studio rule.

**Privacy by design.** Names, contact details, answers and links are encrypted (AES-256-GCM) before they reach the database; emails and links are looked up by keyed hash. The database holds no readable personal data. Pages are marked `noindex`.

## Deploying on Vercel

### 1. Create the database (Mumbai)

Use **Supabase** (free tier is enough to start):

1. supabase.com → New project → **Region: South Asia (Mumbai)**.
2. Project → **Connect** → copy the **Transaction pooler** connection string (port 6543). Put your database password into it.

Any Postgres works (Neon via the Vercel Marketplace also does), but choose a region in or near India. The tables are created automatically on first use.

### 2. Set up email (Gmail)

Codes are sent from your Gmail account (about 500 emails a day).

1. Google Account → Security → turn on **2-Step Verification** if it is off.
2. Google Account → search **App passwords** → create one named "PLINTH portal". Copy the 16-character password.

(Resend with your own domain also works: set `RESEND_API_KEY` and `EMAIL_FROM` instead of the two Gmail settings.)

### 3. Import the repository

1. vercel.com → **Add New → Project** → import `akashowg/plinth-parent-portal`.
2. Framework is detected as Next.js. Leave build settings as they are.
3. Before deploying, add the environment variables below, then **Deploy**.

### 4. Environment variables

The quickest database route is Vercel → Project → **Storage** → Create → Supabase (region Mumbai): Vercel connects it automatically.

| Name | Value |
| --- | --- |
| `DATABASE_URL` | *Not needed* if the database was added from Vercel → Storage (the portal reads the `POSTGRES_URL` Vercel adds). Otherwise the Supabase transaction-pooler string |
| `DATA_ENCRYPTION_KEY` | 32-byte key: run `openssl rand -base64 32` in Terminal. **Also save it in your password manager: if it is lost, stored answers cannot be read.** |
| `SESSION_SECRET` | *Optional.* If unset, a signing key is derived from `DATA_ENCRYPTION_KEY` |
| `ADMIN_PASSWORD` | A long password only you know, for `/admin` |
| `GMAIL_USER` | The Gmail address codes are sent from |
| `GMAIL_APP_PASSWORD` | The app password from step 2 |
| `EMAIL_FROM` | *Optional.* Display name and address, e.g. `PLINTH <you@gmail.com>`; defaults to `PLINTH <GMAIL_USER>` |
| `CONTACT_EMAIL` | The address shown in the privacy notice for questions and grievances |
| `PUBLIC_BASE_URL` | The site address, e.g. `https://parents.plinthnetwork.in` (used in the child and teacher links) |
| `ADMIN_EMAIL` | *Optional.* Where new-profile and form-received alerts go. Alerts never contain answers |
| `SAFEGUARDING_EMAIL` | *Optional.* Who receives safeguarding alerts. Falls back to `ADMIN_EMAIL`, then `CONTACT_EMAIL` |
| `SAFEGUARDING_CONTACT_NAME` | *Optional.* The named person shown on consent and assent screens. Default "Akash Bhattacharya, PLINTH HDI reviewer" |

Never set `DEV_SHOW_CODES` on Vercel. After adding or changing settings, redeploy (Deployments → ⋯ → Redeploy).

### 5. Custom domain (optional)

Vercel → Project → Settings → Domains → add e.g. `parents.plinthnetwork.in`, follow the DNS instructions, then update `PUBLIC_BASE_URL` and redeploy.

### 6. First check after deploying

Open `/admin`, sign in, and confirm there is no "Settings not configured" warning. Then run one test profile end to end with your own email, and erase it from the admin page.

## Using it day to day

1. Send parents the site address.
2. For a **Band A** case, arrange the read-aloud session with the family; open the child link from the admin case page (or send it to the school counsellor).
3. Act on any **safeguarding** trigger within 48 hours and record what you did. The export stays locked until you do.
4. When a case shows **Ready for Studio**, read the validity flags and ledger, sign off, click **Copy intake**, paste into Studio → Analyse, choose the report type and run.
5. Set the case to **In Studio**. This locks the forms so the intake you analysed cannot change underneath you.
6. After review, send the dossier to the parent and set the case to **Delivered**.
7. If a parent withdraws, the portal deletes their answers automatically and emails `ADMIN_EMAIL`. Delete the matching Studio copy too.

## PLINTH Studio

Studio (on the Mac) recognises a v2.0 export automatically (`plinth/ledger.py`, wired in by `tools/apply_ledger_v2.py`). It puts the ledger rules into every prompt, caps each dimension's confidence at what the ledger supports, adds every contradiction to the fact sheet, and checks the written dossier sentence by sentence: definite statements about suggest-only constructs, missing contradictions, Holland codes, safeguarding content, “validated assessment” claims and comprehension claims that ignore a language mismatch go into the correction rounds and, if still open, to your review list. Test: `python3 tests/test_ledger_v2.py` in the Studio folder.

## Changing the questions

The item bank lives in `lib/instrument/`: `student.ts`, `parent.ts`, `teacher.ts` (English and Hindi side by side), `constructs.ts` (which items feed which construct, and the HDI-7 / PIC-5 mapping), `scoring.ts` (validity and ledger), `derived.ts`, `safeguarding.ts`. Item keys are permanent: never reuse a key for a different question — retire it and add a new one, then change `INSTRUMENT_VERSION` in `forms.ts`. Interface text lives in `lib/i18n.ts` and `lib/instrument/ui.ts`.

## Speaking instead of typing

Every written answer in the parent, child and teacher forms has **Speak your answer** and **Speak on video**.

- Speech is turned into text by the browser's own speech service (Web Speech API: Google on Chrome and Android,
  Apple on Safari). PLINTH never receives audio or video: there is no MediaRecorder and no upload.
- The person sees the words appear, corrects them, and presses **Add to my answer**. Only that text is saved,
  appended to anything already typed, and it goes through the same safeguarding scan as typed text.
- Video mode opens the front camera as a local mirror only (no audio track); the camera switches off on Stop.
- The speaking language defaults to the page language and can be changed (all 11 languages, `xx-IN` locales).
- Browsers without speech recognition (Firefox, some in-app browsers) show a tip to use the keyboard's
  microphone key instead of dead buttons.
- `Permissions-Policy` allows `microphone=(self)` and `camera=(self)`; everything else stays blocked.
- Test: `tests/e2e_voice.py` (scripted speech engine and fake camera).

## Languages

English and Hindi are written side by side in the code. The other nine languages are catalogs in `lib/i18n/catalogs/<code>.json` — arrays aligned to `lib/i18n/source.json`, which is **append-only** (a string keeps its index forever, so changing or adding text never shifts existing translations). Anything without a translation falls back to English.

After changing any English text: `npx tsx scripts/i18n-extract.ts` (adds new strings to the end of `source.json` and reports what each language is missing), translate the new indices into `lib/i18n/work/<code>.<n>.json` as `{"index": "text"}`, run `python3 scripts/i18n-merge.py` (checks placeholders, line breaks and script, then writes the catalogs), and confirm with `npx tsx tests/i18n-coverage.test.ts`. Child-facing text uses the informal register (তুমি, तू, నువ్వు, நீ, તું, تم, ನೀನು, ତୁମେ, നീ); parent and teacher text is formal. Urdu pages are right-to-left; names and email addresses inserted into Urdu sentences are wrapped in Unicode isolates so they keep their own order. Fonts are Noto, loaded per script only when that script appears on the page. Every non-English, non-Hindi page carries a short note that the translation is a draft under native-speaker review.

## Before launch — needs a decision or a review

- **Pilot first.** v2.0 is a pre-pilot instrument. Run stage V0 (think-aloud with 12 children, 4 per band) before wider use, and describe it as a structured developmental inventory, not a validated assessment, until V3.
- **Translations.** Hindi and the nine catalog languages are careful drafts and should each be read by a native speaker before families use them — the child forms first (register, gender forms in Marathi and Urdu, how a 12-year-old reads each question), then consent and the privacy notice, which carry legal weight. Until a language is reviewed, the on-page note asks families to switch to English or Hindi if anything is unclear.
- **Safeguarding lexicon v3** passes its corpus (88/88 risk phrasings across twelve languages, 0/33 benign false alarms) but that corpus was written in-house. Before scale, have a child-protection professional review the categories and urgency rules, have native-speaking safeguarding staff review the nine native-script lists (they are a starter set), and add regional-language phrases (Chhattisgarhi, Halbi, Gondi) at /admin/safeguarding from real cases. Decide the named contact for school-referred families.
- **Legal review.** The consent points, privacy notice (`app/privacy/page.tsx`), the safeguarding promise, the 30-day erasure promise and the email-code method of verifying a parent need a lawyer's check against the DPDP Rules before children's data obligations apply (14 May 2027).
- **Back-ups.** Turn on Supabase backups (point-in-time recovery on a paid plan) and keep the encryption key safe.

## Local development

```bash
npm install
cp .env.example .env.local   # fill in values; DEV_SHOW_CODES=1 shows email codes on screen
npm run dev
```
