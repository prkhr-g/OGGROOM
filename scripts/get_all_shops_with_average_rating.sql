CREATE OR REPLACE FUNCTION get_all_shops_with_average_rating()
RETURNS TABLE (
    id UUID,
    name VARCHAR,
    type VARCHAR,
    address TEXT,
    is_open BOOLEAN,
    opening_time TEXT,
    closing_time TEXT,
    shop_latitude DOUBLE PRECISION,
    shop_longitude DOUBLE PRECISION,
    average_rating NUMERIC(3, 2)
)
LANGUAGE plpgsql
AS $
BEGIN
    RETURN QUERY
    SELECT
        s.id,
        s.name,
        s.type,
        s.address,
        s.is_open,
        s.opening_time::text,
        s.closing_time::text,
        s.shop_latitude,
        s.shop_longitude,
        COALESCE(AVG(r.rating), 0)::NUMERIC(3, 2) AS average_rating
    FROM
        shops s
    LEFT JOIN
        reviews r ON s.id = r.shop_id
    GROUP BY
        s.id, s.name, s.type, s.address, s.is_open, s.opening_time, s.closing_time, s.shop_latitude, s.shop_longitude
    ORDER BY
        average_rating DESC;
END;
$;