# Justype

A fast, minimal typing test app with accounts and leaderboards.

**Stack:** React + Vite · Supabase (auth, DB) · Vercel (hosting)

---

## Setup

### 1. Clone & install

```bash
git clone https://github.com/YOUR_USERNAME/justype
cd justype
npm install
```

### 2. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) → New project
2. Open the **SQL Editor** and run the contents of `supabase_schema.sql`
3. Go to **Project Settings → API** and copy:
   - Project URL
   - anon/public key

### 3. Configure env variables

```bash
cp .env.example .env
```

Fill in your `.env`:
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Run locally

```bash
npm run dev
```

---

## Deploy to Vercel

1. Push to GitHub
2. Go to [vercel.com](https://vercel.com) → Import project
3. Add environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Deploy ✓

---

## Supabase: Enable email auth

Go to **Authentication → Providers → Email** and make sure it's enabled.

To skip email confirmation during development:
**Authentication → Settings → Disable email confirmations** (toggle off)
