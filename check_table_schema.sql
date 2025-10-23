-- Check schema for the 'customers' table
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM
    information_schema.columns
WHERE
    table_schema = 'public' AND table_name = 'customers'
ORDER BY
    ordinal_position;

-- Check schema for the 'shop_owners' table
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM
    information_schema.columns
WHERE
    table_schema = 'public' AND table_name = 'shop_owners'
ORDER BY
    ordinal_position;