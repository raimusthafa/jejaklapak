-- ==============================================================================
-- JejakLapak — Supabase Database Migration & RLS Security Script
-- Jalankan skrip ini di Supabase SQL Editor
-- ==============================================================================

-- 1. Create Enums
DO $$ BEGIN
    CREATE TYPE "UserRole" AS ENUM ('CUSTOMER', 'MERCHANT', 'ADMIN');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "VerificationStatus" AS ENUM ('UNVERIFIED', 'PENDING', 'VERIFIED', 'REJECTED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "SessionStatus" AS ENUM ('ACTIVE', 'PAUSED', 'ENDED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Create Tables
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    password_hash TEXT,
    role "UserRole" NOT NULL DEFAULT 'MERCHANT',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.merchants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    image TEXT,
    phone TEXT NOT NULL,
    address TEXT NOT NULL,
    district TEXT NOT NULL,
    city TEXT NOT NULL DEFAULT 'Bandung',
    operating_area TEXT NOT NULL,
    verification_status "VerificationStatus" NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.merchant_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    merchant_id UUID NOT NULL REFERENCES public.merchants(id) ON DELETE CASCADE,
    day_of_week INT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
    is_open BOOLEAN NOT NULL DEFAULT true,
    start_time TEXT NOT NULL,
    end_time TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT merchant_schedules_merchant_day_unique UNIQUE (merchant_id, day_of_week)
);

CREATE TABLE IF NOT EXISTS public.selling_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    merchant_id UUID NOT NULL REFERENCES public.merchants(id) ON DELETE CASCADE,
    status "SessionStatus" NOT NULL DEFAULT 'ACTIVE',
    started_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    paused_at TIMESTAMPTZ,
    ended_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.merchant_locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    merchant_id UUID NOT NULL REFERENCES public.merchants(id) ON DELETE CASCADE,
    session_id UUID REFERENCES public.selling_sessions(id) ON DELETE SET NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    accuracy DOUBLE PRECISION,
    captured_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.menu_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    merchant_id UUID NOT NULL REFERENCES public.merchants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    price INT NOT NULL,
    image TEXT,
    is_available BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. Indexes
CREATE INDEX IF NOT EXISTS idx_merchants_owner ON public.merchants(owner_id);
CREATE INDEX IF NOT EXISTS idx_merchants_category ON public.merchants(category);
CREATE INDEX IF NOT EXISTS idx_merchants_district ON public.merchants(district);
CREATE INDEX IF NOT EXISTS idx_merchants_status ON public.merchants(verification_status);
CREATE INDEX IF NOT EXISTS idx_schedules_merchant ON public.merchant_schedules(merchant_id);
CREATE INDEX IF NOT EXISTS idx_sessions_merchant_status ON public.selling_sessions(merchant_id, status);
CREATE INDEX IF NOT EXISTS idx_locations_merchant_time ON public.merchant_locations(merchant_id, captured_at DESC);
CREATE INDEX IF NOT EXISTS idx_menu_items_merchant ON public.menu_items(merchant_id);

-- 4. Enable Row Level Security (RLS) on all tables (WAJIB)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.merchants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.merchant_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.selling_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.merchant_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies
-- Users: User can read/update their own profile
CREATE POLICY "Users can read own profile" ON public.users
    FOR SELECT TO authenticated
    USING ((select auth.uid()) = id);

CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE TO authenticated
    USING ((select auth.uid()) = id)
    WITH CHECK ((select auth.uid()) = id);

-- Merchants:
-- Public can view active/verified merchants
CREATE POLICY "Public can view verified merchants" ON public.merchants
    FOR SELECT TO anon, authenticated
    USING (verification_status = 'VERIFIED' OR (select auth.uid()) = owner_id);

-- Merchant owner can update their own merchant profile
CREATE POLICY "Owners can update own merchant" ON public.merchants
    FOR UPDATE TO authenticated
    USING ((select auth.uid()) = owner_id)
    WITH CHECK ((select auth.uid()) = owner_id);

CREATE POLICY "Owners can insert merchant" ON public.merchants
    FOR INSERT TO authenticated
    WITH CHECK ((select auth.uid()) = owner_id);

-- Schedules:
-- Public can read all schedules
CREATE POLICY "Public can view schedules" ON public.merchant_schedules
    FOR SELECT TO anon, authenticated
    USING (true);

-- Owners can manage schedules
CREATE POLICY "Owners can manage schedules" ON public.merchant_schedules
    FOR ALL TO authenticated
    USING (EXISTS (
        SELECT 1 FROM public.merchants WHERE id = merchant_id AND owner_id = (select auth.uid())
    ));

-- Sessions:
-- Public can view active sessions
CREATE POLICY "Public can view active sessions" ON public.selling_sessions
    FOR SELECT TO anon, authenticated
    USING (true);

-- Owners can manage sessions
CREATE POLICY "Owners can manage sessions" ON public.selling_sessions
    FOR ALL TO authenticated
    USING (EXISTS (
        SELECT 1 FROM public.merchants WHERE id = merchant_id AND owner_id = (select auth.uid())
    ));

-- Locations:
-- Public can view location history
CREATE POLICY "Public can view locations" ON public.merchant_locations
    FOR SELECT TO anon, authenticated
    USING (true);

-- Owners can insert current GPS location
CREATE POLICY "Owners can insert location" ON public.merchant_locations
    FOR INSERT TO authenticated
    WITH CHECK (EXISTS (
        SELECT 1 FROM public.merchants WHERE id = merchant_id AND owner_id = (select auth.uid())
    ));

-- Menu Items:
-- Public can view menu items
CREATE POLICY "Public can view menu items" ON public.menu_items
    FOR SELECT TO anon, authenticated
    USING (true);

-- Owners can manage menu items
CREATE POLICY "Owners can manage menu items" ON public.menu_items
    FOR ALL TO authenticated
    USING (EXISTS (
        SELECT 1 FROM public.merchants WHERE id = merchant_id AND owner_id = (select auth.uid())
    ));

-- 6. Trigger: Auto-create public.users profile when auth.users signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, name, email, role)
    VALUES (
        new.id,
        COALESCE(new.raw_user_meta_data->>'name', 'Pedagang Baru'),
        new.email,
        'MERCHANT'
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

