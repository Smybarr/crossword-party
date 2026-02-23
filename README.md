# World's Largest Crossword Party

A collaborative crossword-solving app where friends and family work together to complete the world's largest crossword puzzle.

## Tech Stack

- **React 19** with TypeScript
- **Vite 7** for dev server and builds
- **Tailwind CSS v4** for styling
- **shadcn/ui** component library
- **Supabase** for database, real-time subscriptions, and (future) auth
- **canvas-confetti** for solve celebrations

## Setup

```bash
# Use the correct Node version
nvm use

# Install dependencies
npm install

# Create .env.local with your Supabase credentials
cp .env.local.example .env.local
# Edit .env.local with:
#   VITE_SUPABASE_URL=https://your-project.supabase.co
#   VITE_SUPABASE_ANON_KEY=your-anon-key

# Start dev server
npm run dev
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Type-check and build for production |
| `npm run preview` | Preview the production build |
| `npm run lint` | Run ESLint |

## Future: Authentication

The app currently uses a simple name-picker for identifying solvers. To add proper authentication:

### Google OAuth

1. Create an OAuth 2.0 client in the [GCP Console](https://console.cloud.google.com/apis/credentials)
2. Set the authorized redirect URI to `https://<your-project>.supabase.co/auth/v1/callback`
3. Enable Google provider in the [Supabase Dashboard](https://supabase.com/dashboard) under Authentication > Providers
4. Add the Client ID and Client Secret from GCP

### Apple Sign-In

1. Create a Services ID in the [Apple Developer Portal](https://developer.apple.com/account/resources/identifiers/list/serviceId)
2. Generate a signing key (.p8 file) under Keys
3. Configure the Apple provider in the Supabase Dashboard with the Services ID, Team ID, Key ID, and .p8 private key

### Client Code

```ts
// Sign in with Google
await supabase.auth.signInWithOAuth({ provider: 'google' })

// Sign in with Apple
await supabase.auth.signInWithOAuth({ provider: 'apple' })
```
