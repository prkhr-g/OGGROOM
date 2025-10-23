-- Allow NULL values for 'name' and 'email' in the 'customers' table
ALTER TABLE customers ALTER COLUMN name DROP NOT NULL;
ALTER TABLE customers ALTER COLUMN email DROP NOT NULL;

-- Allow NULL values for 'name' and 'email' in the 'shop_owners' table
ALTER TABLE shop_owners ALTER COLUMN name DROP NOT NULL;
ALTER TABLE shop_owners ALTER COLUMN email DROP NOT NULL;