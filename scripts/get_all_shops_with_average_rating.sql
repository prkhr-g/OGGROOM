CREATE OR REPLACE FUNCTION get_all_shops_with_average_rating()
RETURNS TABLE (
    id uuid,
    name text,
    type text,
    email text,
    phone text,
    address text,
    is_open boolean,
    opening_time time,
    closing_time time,
    average_rating double precision
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        s.id,
        s.name,
        s.type,
        s.email,
        s.phone,
        s.address,
        s.is_open,
        s.opening_time,
        s.closing_time,
        COALESCE(AVG(r.rating), 0)::double precision as average_rating
    FROM
        shops s
    LEFT JOIN
        reviews r ON s.id = r.shop_id
    GROUP BY
        s.id, s.name, s.type, s.email, s.phone, s.address, s.is_open, s.opening_time, s.closing_time;
END;
$$;