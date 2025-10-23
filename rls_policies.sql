-- =============================================================================
-- Customers RLS Policies
-- =============================================================================

-- 1. Enable Row Level Security for the customers table
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

-- 2. Policy to allow authenticated users to SELECT their own customer record
CREATE POLICY "Customers can view their own data."
ON customers FOR SELECT
USING (auth.uid() = id);

-- 3. Policy to allow authenticated users to INSERT their own customer record
CREATE POLICY "Customers can insert their own data."
ON customers FOR INSERT
WITH CHECK (auth.uid() = id);

-- 4. Policy to allow authenticated users to UPDATE their own customer record
CREATE POLICY "Customers can update their own data."
ON customers FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- 5. Policy to allow authenticated users to DELETE their own customer record
CREATE POLICY "Customers can delete their own data."
ON customers FOR DELETE
USING (auth.uid() = id);

-- =============================================================================
-- Shop Owners RLS Policies
-- =============================================================================

-- 1. Enable Row Level Security for the shop_owners table
ALTER TABLE shop_owners ENABLE ROW LEVEL SECURITY;

-- 2. Policy to allow authenticated users to SELECT their own shop_owner record
CREATE POLICY "Shop owners can view their own data."
ON shop_owners FOR SELECT
USING (auth.uid() = id);

-- 3. Policy to allow authenticated users to INSERT their own shop_owner record
CREATE POLICY "Shop owners can insert their own data."
ON shop_owners FOR INSERT
WITH CHECK (auth.uid() = id);

-- 4. Policy to allow authenticated users to UPDATE their own shop_owner record
CREATE POLICY "Shop owners can update their own data."
ON shop_owners FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- 5. Policy to allow authenticated users to DELETE their own shop_owner record
CREATE POLICY "Shop owners can delete their own data."
ON shop_owners FOR DELETE
USING (auth.uid() = id);