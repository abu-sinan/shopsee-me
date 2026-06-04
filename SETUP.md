# ShopSeeMe — Complete Setup Guide

## Prerequisites
- Node.js 20+
- npm or yarn
- Supabase account (free tier works)
- Vercel account (for deployment)

## Step 1 — Install Dependencies
```bash
cd shopsee-me
npm install
```

## Step 2 — Supabase Setup
1. Go to https://supabase.com → New Project
2. Copy your **Project URL** and **Anon Key** from Settings → API
3. Run `supabase-schema.sql` in the SQL Editor
4. Create storage bucket (included in SQL file)

## Step 3 — Environment Variables
```bash
cp .env.local.example .env.local
```
Fill in:
```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhb...
SUPABASE_SERVICE_ROLE_KEY=eyJhb...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## Step 4 — Create Admin User
1. Start the app: `npm run dev`
2. Go to http://localhost:3000/login → Create Account
3. In Supabase SQL Editor, run:
```sql
UPDATE public.profiles 
SET role = 'admin' 
WHERE email = 'your@email.com';
```
4. Admin dashboard: http://localhost:3000/admin

## Step 5 — Add Images
Replace placeholder images in `public/images/` — see `public/images/IMAGE_GUIDE.md`

## Step 6 — Add Categories
Go to `/admin/categories` and add:
- Men
- Women  
- Kids
- Accessories

## Step 7 — Add Products
Go to `/admin/products` → Add Product
- Upload images via the image uploader
- Set variants (size, stock, SKU)

## Step 8 — Deploy to Vercel
```bash
npm install -g vercel
vercel deploy
```
Set environment variables in Vercel Dashboard → Settings → Environment Variables

## shadcn/ui Setup (Optional)
If you want shadcn components:
```bash
npx shadcn@latest init
npx shadcn@latest add button input label sheet dropdown-menu badge separator toast dialog drawer skeleton
```

## Common Issues

**Build error: Module not found**
→ Run `npm install` again

**Supabase auth not working**
→ Check Site URL in Supabase: Authentication → URL Configuration → Site URL = your domain

**Images not loading**  
→ Add your Supabase storage URL to `next.config.ts` remotePatterns

**Admin access denied**
→ Make sure you ran the SQL to set role = 'admin'

## Tech Stack
- Next.js 15 App Router
- TypeScript (strict)
- Tailwind CSS
- Framer Motion
- Supabase (DB + Auth + Realtime + Storage)
- Zustand
- React Hook Form + Zod
- Recharts (analytics)
