# OPI Evaluation App - Setup Guide

## Prerequisites

- Node.js 18+ and npm
- Supabase account (https://supabase.com)
- Anthropic API key (https://console.anthropic.com)

## 1. Environment Setup

Copy `.env.local.example` to `.env.local` and fill in your credentials:

```bash
cp .env.local.example .env.local
```

Then edit `.env.local` with:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
ANTHROPIC_API_KEY=sk-ant-...
```

### Getting Supabase Credentials

1. Go to [supabase.com](https://supabase.com) and create a new project
2. In your project dashboard, go to **Settings** > **API**
3. Copy your **Project URL** and **Anon Key**

### Getting Anthropic API Key

1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Create or use an existing API key

## 2. Database Setup

### Option A: Using Supabase Dashboard (Recommended)

1. Go to your Supabase project's SQL Editor
2. Create a new query
3. Copy the entire contents of `supabase/migrations/001_create_tables.sql`
4. Run the query

### Option B: Using Supabase CLI

```bash
# Install Supabase CLI if not already installed
npm install -g supabase

# Link to your project
supabase link --project-ref your-project-ref

# Apply migrations
supabase db push
```

## 3. Install Dependencies

```bash
npm install
```

## 4. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:3000` to see the application.

## 5. Verify Setup

To verify everything is working:

1. Start the dev server
2. Navigate to `/` (home page)
3. The page should load without errors in the browser console

## Database Schema

The setup creates three main tables:

### `clients` (施設マスタ)
Stores facility/organization information
- `id`: Unique identifier
- `name`: Facility name
- `facility_type`: Type of facility
- `safety_threshold_pct`: Safety score threshold (default: 50%)
- `total_threshold_pct`: Total score threshold (default: 80%)

### `candidates` (受験者)
Stores information about interview candidates
- `id`: Unique identifier
- `client_id`: Reference to facility
- `name`: Candidate name
- `nationality`: Country of origin
- `native_language`: L1 language (for bias monitoring)
- `care_experience`: Whether candidate has care experience
- `jlpt_level`, `jft_score`: Japanese language test scores

### `evaluations` (採点結果)
Stores evaluation results for each interview
- All scoring fields (safety, language, care aptitude)
- Risk flags and quality warnings
- Verdict and recommended actions
- Interviewer comments

## Troubleshooting

### "Cannot find module '@supabase/supabase-js'"
Run `npm install` to install dependencies.

### "NEXT_PUBLIC_SUPABASE_URL is not defined"
Check that `.env.local` exists and contains the correct environment variables. The dev server needs to be restarted after changing `.env.local`.

### Database Connection Errors
1. Verify your Supabase project is active
2. Check that your API key is correct
3. Make sure the IP address of your development machine is not blocked

## Next Steps

- Check out the design plan in the root directory for implementation roadmap
- Explore the component structure in `/components`
- Review the evaluation logic in `/lib`
