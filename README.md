# Hotel Marseille

A private hotel check-in/check-out dashboard for Hotel Marseille.

The current version is a local demo built with plain HTML, CSS, and JavaScript. The next step is to connect it to Supabase, deploy it on Vercel, and protect it with a private login.

## Current Demo

Open `index.html` directly in the browser to test the local demo.

The demo currently saves data in `localStorage`, so data stays only in the same browser.

## Local Development

After installing dependencies:

```bash
npm install
npm run dev
```

Then open the local Vite URL in the browser.

## Environment Variables

Copy `.env.example` to `.env.local` and fill in the Supabase values:

```bash
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_APP_LOGIN_EMAIL=batumimarseille@gmail.com
```

Do not commit real passwords or secret keys.

## Supabase Setup

1. Open Supabase SQL Editor.
2. Run `supabase/schema.sql`.
3. Create the first user in Supabase Auth using the hotel email.
4. Add the Supabase URL and anon key to Vercel environment variables.

## Deployment

The app is planned to be deployed on Vercel from GitHub.

Suggested first deployment flow:

1. Push this project to GitHub.
2. Import the GitHub repository in Vercel.
3. Add Supabase environment variables in Vercel.
4. Deploy.
