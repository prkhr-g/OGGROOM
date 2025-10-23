-- Enable Row Level Security for the shop_owners table
ALTER TABLE shop_owners ENABLE ROW LEVEL SECURITY;

-- Drop any existing policies to ensure a clean slate
DROP POLICY IF EXISTS "Allow all access to own shop owner profile" ON shop_owners;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON shop_owners;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON shop_owners;
DROP POLICY IF EXISTS "Shop owners can delete their own data." ON shop_owners;
DROP POLICY IF EXISTS "Shop owners can insert their own data." ON shop_owners;
DROP POLICY IF EXISTS "Shop owners can update their own data." ON shop_owners;
DROP POLICY IF EXISTS "Shop owners can view their own data." ON shop_owners;
DROP POLICY IF EXISTS "Shop owners can view their own record" ON shop_owners;


-- Policy to allow authenticated users to SELECT their own shop_owner record
CREATE POLICY "Shop owners can view their own data."
ON shop_owners FOR SELECT
USING (auth.uid() = id);

-- Policy to allow authenticated users to INSERT their own shop_owner record
CREATE POLICY "Shop owners can insert their own data."
ON shop_owners FOR INSERT
WITH CHECK (auth.uid() = id);

-- Policy to allow authenticated users to UPDATE their own shop_owner record
CREATE POLICY "Shop owners can update their own data."
ON shop_owners FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Policy to allow authenticated users to DELETE their own shop_owner record
CREATE POLICY "Shop owners can delete their own data."
ON shop_owners FOR DELETE
USING (auth.uid() = id);