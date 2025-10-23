-- Add default UUID generation to the 'id' column of the 'customers' table
ALTER TABLE customers ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- Add default UUID generation to the 'id' column of the 'shop_owners' table
ALTER TABLE shop_owners ALTER COLUMN id SET DEFAULT gen_random_uuid();