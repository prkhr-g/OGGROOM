-- 1. Enable Row Level Security for the shop_owners table (if not already enabled)
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