-- 1. Drop existing tables and functions to start fresh
DROP TABLE IF EXISTS bookings CASCADE;
DROP TABLE IF EXISTS barbers CASCADE;
DROP TABLE IF EXISTS services CASCADE;
DROP TABLE IF EXISTS shop_owners CASCADE;
DROP TABLE IF EXISTS shops CASCADE;
DROP TABLE IF EXISTS customers CASCADE;
DROP FUNCTION IF EXISTS is_shop_owner(uuid);
DROP FUNCTION IF EXISTS create_shop_and_owner(text, text, text, text, text, text, text, text, time, time);
DROP FUNCTION IF EXISTS create_customer_profile(text, text);

-- 2. Create Tables
CREATE TABLE IF NOT EXISTS shops (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(100) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20),
    address TEXT,
    is_open BOOLEAN DEFAULT true,
    opening_time TIME DEFAULT '09:00:00',
    closing_time TIME DEFAULT '18:00:00',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS shop_owners (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    shop_id UUID REFERENCES shops(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    age INTEGER,
    sex VARCHAR(50),
    phone VARCHAR(20),
    location VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS services (
    id BIGSERIAL PRIMARY KEY,
    shop_id UUID REFERENCES shops(id) ON DELETE CASCADE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    duration INTEGER NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS barbers (
    id BIGSERIAL PRIMARY KEY,
    shop_id UUID REFERENCES shops(id) ON DELETE CASCADE NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20),
    specialties TEXT[],
    experience VARCHAR(100),
    rating DECIMAL(3,2) DEFAULT 4.5,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS bookings (
    id BIGSERIAL PRIMARY KEY,
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE NOT NULL,
    shop_id UUID REFERENCES shops(id) ON DELETE CASCADE NOT NULL,
    barber_id BIGINT REFERENCES barbers(id) ON DELETE SET NULL,
    service_ids BIGINT[],
    booking_date DATE NOT NULL,
    booking_time TIME NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    total_price DECIMAL(10,2),
    total_duration INTEGER,
    customer_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Create RPC functions

-- Function to create a customer profile
CREATE OR REPLACE FUNCTION create_customer_profile(
    p_name text,
    p_email text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.customers (id, name, email)
  VALUES (auth.uid(), p_name, p_email);
END;
$$;

-- Function to create a shop and owner, and also a customer profile
CREATE OR REPLACE FUNCTION create_shop_and_owner(
    owner_name text,
    owner_email text,
    owner_phone text,
    shop_name text,
    shop_type text,
    shop_email text,
    shop_phone text,
    shop_address text,
    opening_time time,
    closing_time time
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $
DECLARE
  new_shop_id UUID;
  existing_owner_id UUID;
BEGIN
  -- Check if an owner already exists for the current authenticated user
  SELECT id INTO existing_owner_id FROM public.shop_owners WHERE id = auth.uid();

  IF existing_owner_id IS NOT NULL THEN
    RAISE EXCEPTION 'User already owns a shop. Cannot create another shop.';
  END IF;

  -- Then create the shop
  INSERT INTO public.shops (name, type, email, phone, address, opening_time, closing_time)
  VALUES (shop_name, shop_type, shop_email, shop_phone, shop_address, opening_time, closing_time)
  RETURNING id INTO new_shop_id;

  -- Finally, create the shop owner and link to the shop
  INSERT INTO public.shop_owners (id, name, email, phone, shop_id)
  VALUES (auth.uid(), owner_name, owner_email, owner_phone, new_shop_id);

END;
$;

-- 4. Create RLS Policies
ALTER TABLE shops ENABLE ROW LEVEL SECURITY;
ALTER TABLE shop_owners ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE barbers ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION is_shop_owner(shop_id_to_check UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.shop_owners
    WHERE shop_owners.shop_id = shop_id_to_check AND shop_owners.id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE POLICY "Allow all access to own shop owner profile" ON public.shop_owners FOR ALL USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "Allow owners to view, update, delete own shops" ON public.shops FOR ALL USING (is_shop_owner(id));
CREATE POLICY "Allow authenticated to see all shops" ON public.shops FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated users to reference shops" ON public.shops FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow owners to manage shop data" ON public.services FOR ALL USING (is_shop_owner(shop_id)) WITH CHECK (is_shop_owner(shop_id));
CREATE POLICY "Allow authenticated to see all services" ON public.services FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow owners to manage shop data" ON public.barbers FOR ALL USING (is_shop_owner(shop_id)) WITH CHECK (is_shop_owner(shop_id));
CREATE POLICY "Allow authenticated to see all barbers" ON public.barbers FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow owners to manage shop data" ON public.bookings FOR ALL USING (is_shop_owner(shop_id)) WITH CHECK (is_shop_owner(shop_id));
CREATE POLICY "Allow users to manage own customer profile" ON public.customers FOR ALL USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Policy for customers to insert their own bookings
CREATE POLICY "Allow customers to insert their own bookings"
ON public.bookings FOR INSERT
WITH CHECK (customer_id = auth.uid());

-- Policy for customers to view their own bookings
CREATE POLICY "Allow customers to view their own bookings"
ON public.bookings FOR SELECT
USING (customer_id = auth.uid());