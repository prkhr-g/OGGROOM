DROP FUNCTION IF EXISTS public.get_nearby_shops(double precision, double precision, integer);

CREATE OR REPLACE FUNCTION public.get_nearby_shops(
    p_latitude double precision,
    p_longitude double precision,
    p_radius_meters integer DEFAULT 10000 -- Default to 10 km radius
)
RETURNS TABLE (
    id uuid,
    name text,
    type text,
    email text,
    phone text,
    address text,
    is_open boolean,
    opening_time text,
    closing_time text,
    shop_latitude double precision,
    shop_longitude double precision,
    distance_meters double precision,
    average_rating double precision
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        s.id::uuid,
        s.name::text,
        s.type::text,
        s.email::text,
        s.phone::text,
        s.address::text,
        s.is_open::boolean,
        s.opening_time::text,
        s.closing_time::text,
        s.shop_latitude::double precision,
        s.shop_longitude::double precision,
        ST_Distance(
            ST_SetSRID(ST_MakePoint(s.shop_longitude, s.shop_latitude), 4326)::geography,
            ST_SetSRID(ST_MakePoint(p_longitude, p_latitude), 4326)::geography
        )::double precision AS distance_meters,
        COALESCE(AVG(r.rating), 0)::double precision as average_rating
    FROM
        public.shops s
    LEFT JOIN
        public.reviews r ON s.id = r.shop_id
    WHERE
        s.shop_latitude IS NOT NULL AND s.shop_longitude IS NOT NULL AND
        ST_DWithin(
            ST_SetSRID(ST_MakePoint(s.shop_longitude, s.shop_latitude), 4326)::geography,
            ST_SetSRID(ST_MakePoint(p_longitude, p_latitude), 4326)::geography,
            p_radius_meters
        )
    GROUP BY
        s.id
    ORDER BY
        distance_meters;
END;
$$;