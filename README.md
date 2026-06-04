# ShopSeeMe — Premium Fashion Brand Website

A production-ready premium fashion brand website for Bangladesh, built with Next.js 15, Supabase, and Tailwind CSS.

## Tech Stack
- **Frontend**: Next.js 15 App Router, TypeScript, Tailwind CSS, Framer Motion
- **Backend**: Supabase (Database, Auth, Realtime, Storage)
- **State**: Zustand
- **Forms**: React Hook Form + Zod
- **Hosting**: Vercel (region: sin1 — Singapore)

## Quick Start

### 1. Clone & Install
```bash
git clone <repo>
cd shopsee-me
npm install
```

### 2. Configure Environment
```bash
cp .env.local.example .env.local
# Fill in your Supabase credentials
```

### 3. Set up Supabase
1. Create a new Supabase project at https://supabase.com
2. Run `supabase-schema.sql` in the SQL Editor
3. Copy your project URL and anon key to `.env.local`

### 4. Set First Admin User
After creating your account, run in Supabase SQL Editor:
```sql
update public.profiles set role = 'admin' where email = 'your@email.com';
```

### 5. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

Admin dashboard: [http://localhost:3000/admin](http://localhost:3000/admin)

## Project Structure
```
src/
├── app/             # Next.js App Router pages
│   ├── (store)/     # Customer-facing pages
│   └── admin/       # Admin dashboard pages
├── components/      # Reusable UI components
├── features/        # Page-specific feature components
├── hooks/           # Custom React hooks
├── lib/             # Utilities, Supabase clients, validations
├── services/        # API service functions
├── store/           # Zustand state stores
├── types/           # TypeScript type definitions
├── constants/       # App-wide constants
└── styles/          # Global CSS
```

## Features
- 🛍️ Full e-commerce store (browse, filter, cart, checkout)
- 💬 Real-time customer chat (Supabase Realtime)
- 🔐 Authentication (login, register, password reset)
- 📦 Order tracking
- ❤️ Wishlist
- 🔍 Live search with recent history
- 🎛️ Admin dashboard (products, orders, messages, analytics)
- 📱 Mobile-first, responsive design
- 🗺️ Sitemap, robots.txt, PWA manifest
- 🇧🇩 Bangladesh-focused (BDT currency, BD phone validation, COD payment)

## Deploy to Vercel
```bash
vercel deploy
```

Set environment variables in your Vercel project settings.

## Payment
Currently supports **Cash on Delivery (COD)**. 
bKash and Nagad integration ready to be added.
