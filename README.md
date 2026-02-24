# World's Largest Crossword - Party App

A collaborative web app for solving the "World's Largest Crossword Puzzle" (28,923 clues!) at crossword parties.

## Background

This project was inspired by a friend (Dan) who hosts crossword puzzle parties using the [QVC World's Largest Crossword Puzzle](https://www.qvc.com/play-view-brands-worlds-largest-crossword-puzzle.product.T59491.html). The physical puzzle is 6.5' x 6.5' with over 91,000 squares. The original setup involved paper copies of clues and scanned PDFs—this app aims to streamline the experience.

**This is a personal pet project, not intended for commercial distribution.**

## Tech Stack

- **React 19** with TypeScript
- **Vite 7** for dev server and builds
- **Tailwind CSS v4** for styling
- **shadcn/ui** component library
- **Supabase** for database, real-time subscriptions, and auth (magic link)
- **canvas-confetti** for solve celebrations

## Reference Files

Located in `/ref`:
- `clues_db.json` - All 28,923 clues in JSON format (Dan created this)
- `crossword_clue_book.pdf` - Original 104-page clue book scan

## QR Code

The `/Crossword-Party-QRCode` folder contains QR codes linking to the deployed app in JPG, PNG, SVG, and PDF formats — handy for printing and sharing at parties.

## How It Was Built

See [DEVELOPMENT_TIMELINE.md](DEVELOPMENT_TIMELINE.md) for a detailed session-by-session account of how this app was built using Claude Code, including the prompts, design decisions, and the split between human-driven (UX/design) and AI-driven (implementation/architecture) contributions.

### Clue Data Structure

```json
{
  "number": "1",
  "direction": "Across",
  "text": "Non pro",
  "page": 1
}
```

### Clue Statistics
- **Total clues**: 28,923
- **Across**: 14,461
- **Down**: 14,462
- **Pages**: 1-103

---

## Prerequisites

- [Node.js](https://nodejs.org/) v18 or later (includes npm)
- Works on macOS, Windows, and Linux

### Installing Node.js

**macOS** (using Homebrew):

```bash
brew install node
```

**Windows** (using the installer):

1. Download the LTS installer from [nodejs.org](https://nodejs.org/)
2. Run the installer and follow the prompts
3. Open a new terminal (Command Prompt or PowerShell) to verify:

```powershell
node --version
npm --version
```

Alternatively, use [nvm-windows](https://github.com/coreybutler/nvm-windows) if you need to manage multiple Node versions.

## Supabase Access

The app uses a hosted Supabase project for the database and authentication. To get access:

1. Create a free account at [supabase.com](https://supabase.com) if you don't have one
2. Email sybarra@gmail.com with your Supabase account email to get invited to the project organization
3. Once invited, you can view the project dashboard at [supabase.com/dashboard](https://supabase.com/dashboard)

You don't need dashboard access to run the app locally — only to manage the database or auth settings.

## Setup

1. Clone the repo and install dependencies:

   **macOS / Linux:**

   ```bash
   git clone <repo-url>
   cd worlds-largest-crossword
   npm install
   ```

   **Windows (PowerShell):**

   ```powershell
   git clone <repo-url>
   cd worlds-largest-crossword
   npm install
   ```

2. Create a `.env.local` file with your Supabase credentials:

   **macOS / Linux:**

   ```bash
   cp .env.local.example .env.local
   ```

   **Windows (PowerShell):**

   ```powershell
   Copy-Item .env.local.example .env.local
   ```

   Then edit `.env.local`:

   ```
   VITE_SUPABASE_URL=https://yrvzmkrgmzvarbsqzfet.supabase.co
   VITE_SUPABASE_ANON_KEY=<ask the project owner for this key>
   ```

3. Start the dev server:

   ```bash
   npm run dev
   ```

   The app will be available at `http://localhost:5173`.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Type-check and build for production |
| `npm run preview` | Preview the production build |
| `npm run lint` | Run ESLint |

## Deployment

The app is deployed on [Vercel](https://vercel.com) at [dans-crossword-party.vercel.app](https://dans-crossword-party.vercel.app).

Vercel auto-detects the Vite preset. The only configuration needed:

- **Root Directory:** `./`
- **Build Command:** `npm run build`
- **Output Directory:** `dist`

**Environment variables** (set in Vercel project settings):

| Variable | Description |
|----------|-------------|
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon/publishable key |

**Any code changes pushed to the `main` branch will automatically trigger a new production deployment.** This means broken code on `main` = broken live app. To avoid this:

- **Use a feature branch** for any non-trivial changes. Create a branch (`git checkout -b my-feature`), make your changes, test locally with `npm run dev`, then open a pull request to merge into `main`.
- **Vercel generates preview deployments** for every pull request, so you can test changes at a temporary URL before merging to production.
- **Keep `main` stable** — only merge when you're confident the change works.

If the repo ever has more contributors and you want stronger safeguards, you can enable [branch protection rules](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-a-branch-protection-rule/about-branch-protection-rules) on `main` to require pull request reviews before merging.

### Transferring Ownership

To hand the project to a new owner (e.g. Dan):

1. **GitHub repo**: Go to repo **Settings → General → Transfer ownership** and transfer to the new owner's GitHub account
2. **Vercel project**: The new owner should create a free [Vercel](https://vercel.com) account, then import the repo as a new project — Vercel will auto-detect the Vite preset. Add the two environment variables listed above.
3. **Supabase project**: In the [Supabase dashboard](https://supabase.com/dashboard), go to **Organization settings → Members** and invite the new owner, then transfer the organization ownership. Alternatively, transfer just the project to their organization.

The new owner will have full control over deployments, the database, and auth configuration.

## Authentication

The app uses Supabase magic link auth. Users sign up with their email, first name, and last name, then receive a magic link to log in. Profiles are stored in a `profiles` table and the generated display name (e.g. "John D.") is used for the leaderboard and solve attribution.

**Email case sensitivity**: Emails are handled case-insensitively throughout. The `auto-signin` edge function lowercases both sides when looking up existing users, so `John@example.com` and `john@example.com` resolve to the same account. Returning users are signed in instantly without a magic link email; new users are prompted for their name and sent a magic link to complete registration.

---

## Database Schema

### `clues` table

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Primary key |
| `number` | integer | Clue number (1-24607) |
| `direction` | text | 'Across' or 'Down' |
| `text` | text | The clue text |
| `page` | integer | Page in original clue book (1-103) |
| `status` | text | 'unsolved', 'solved', 'flagged', or 'verified' |
| `answer` | text | The entered answer (nullable) |
| `solved_by` | text | Name of person who solved it (nullable) |
| `solved_at` | timestamptz | When it was solved (nullable) |
| `flagged_by` | text | Name of person who flagged it (nullable) |
| `flagged_reason` | text | Why it was flagged (nullable) |
| `is_recorded` | boolean | Whether this was a pre-existing answer |
| `confirmation_count` | integer | Number of confirmations on flagged clues |
| `previous_answer` | text | Answer before flagging (nullable) |
| `previous_solved_by` | text | Solver before flagging (nullable) |
| `created_at` | timestamptz | Row creation time |
| `updated_at` | timestamptz | Last update time |

### Indexes
- `(number, direction)` - unique constraint
- `status` - for filtering unsolved/solved/flagged
- `page` - for browsing by page

---

## Core Features

1. **Random Clue Generator** — "Give me a random unsolved clue" with optional direction and page range filters
2. **Search & Browse** — Search clues by keyword, browse by page, filter by status
3. **Mark as Solved** — Enter your answer and name; clue moves to "solved"
4. **Flag as Wrong** — Flag a solved clue as potentially incorrect with a reason
5. **Confirm / Correct** — Confirm flagged clues or provide a corrected answer
6. **Leaderboard** — Who's solved the most clues
7. **Profile** — View personal stats (rank, solve count) and sign out
8. **Real-time Updates** — Supabase realtime subscriptions so everyone sees changes instantly

---

## Known Data Issues

The source `clues_db.json` (28,923 entries) contained 73 duplicate `(number, direction)` pairs with conflicting clue text. Investigation by cross-referencing against the original PDF clue book identified three root causes, all related to OCR/data-entry errors during digitization:

### 1. Page 55 Down clues 825–997 (68 duplicates + 27 non-duplicate errors)

**Cause**: 95 Down clues on page 55 with numbers 825–997 were actually clues **1825–1997** — the leading "1" was dropped during OCR. These overlapped with the legitimate page 53 Down clues in the same number range.

**Resolution**: Renumbered all page 55 Down clues in the 825–997 range by adding 1000 (e.g., 825 → 1825). This also filled a gap of missing clues in the 1825–1997 range.

### 2. Page 75 Down clues 21, 23, 24 (3 duplicates)

**Cause**: Three Down clues on page 75 had truncated numbers — they were actually clues **12121, 12123, 12124** (the leading "121" was dropped). These overlapped with the legitimate page 51 Down clues 21 and 24.

**Resolution**: Renumbered to 12121, 12123, and 12124 respectively.

### 3. Page 59 Down clue 4453 (1 duplicate)

**Cause**: Clue 4453 Down appeared twice on page 59 with different text. Positional analysis showed the first entry ("Auditory challenged") was actually **Down 4452** — the clue number was misread.

**Resolution**: Renumbered the first occurrence to 4452. "Bellicose god" remains as 4453.

### Final count

After corrections: **28,850 unique clues** (up from 28,849 after deduplication, since the 4452 clue was recovered). Zero remaining duplicates.

---

## Keeping the Database Alive Between Parties

The Supabase Free Plan **pauses projects after 7 days of inactivity** (no API requests). Since crossword parties may be 2-3 months apart, expect the database to pause between events.

**Your options:**

1. **Just let it pause and restore before the next party** — Click "Restore" in the [Supabase dashboard](https://supabase.com/dashboard) a few days before the party. It takes a few minutes and all data is preserved. You have a **90-day window** for one-click restore after pausing.

2. **Ping it periodically** — A cron job, GitHub Action, or any scheduled task that hits the Supabase API once a week will prevent auto-pause. Even a simple `SELECT 1` via the REST API counts as activity.

3. **Upgrade to Pro ($25/mo)** — Pro projects never auto-pause. Likely overkill for this use case.

For a party app with 2-3 month gaps, option 1 is the simplest. The 90-day restore window comfortably covers the downtime.

---

## Notes

- The puzzle has clue numbers that go up to 24607, but with both Across and Down, there are 28,923 total clues
- Page numbers correspond to the original 104-page clue book (pages 1-103 have clues)
- Some clue text contains special characters and formatting from OCR (e.g., `___` for blanks, quotes, etc.)
- This app doesn't include the actual puzzle grid—just the clues and collaborative solving

---

## License

Personal use only. The World's Largest Crossword Puzzle is a copyrighted product by Play View Brands.
