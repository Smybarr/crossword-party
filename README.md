# World's Largest Crossword Party

A collaborative crossword-solving app where friends and family work together to complete the world's largest crossword puzzle.

## Tech Stack

- **React 19** with TypeScript
- **Vite 7** for dev server and builds
- **Tailwind CSS v4** for styling
- **shadcn/ui** component library
- **Supabase** for database, real-time subscriptions, and auth (magic link)
- **canvas-confetti** for solve celebrations

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
   cd frontend
   npm install
   ```

   **Windows (PowerShell):**

   ```powershell
   git clone <repo-url>
   cd frontend
   npm install
   ```

2. Create a `.env.local` file in the `frontend/` directory with your Supabase credentials:

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

## Authentication

The app uses Supabase magic link auth. Users sign up with their email, first name, and last name, then receive a magic link to log in. Profiles are stored in a `profiles` table and the generated display name (e.g. "John D.") is used for the leaderboard and solve attribution.
