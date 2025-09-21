DROP FUNCTION IF EXISTS public.get_nearby_shops(double precision, double precision, integer);
DROP FUNCTION IF EXISTS public.get_nearby_shops(double precision, double precision, double precision);
DROP FUNCTION IF EXISTS public.get_nearby_shops(double precision, double precision);

CREATE OR REPLACE FUNCTION public.get_nearby_shops(
    p_latitude double precision,
    p_longitude double precision,
    p_radius_meters double precision DEFAULT 10000
)
RETURNS TABLE (
    id uuid,
    name character varying,
    type character varying,
    address text,
    is_open boolean,
    opening_time text,
    closing_time text,
    shop_latitude double precision,
    shop_longitude double precision,
    distance_meters double precision,
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
        ST_Distance(
            ST_SetSRID(ST_MakePoint(s.shop_longitude, s.shop_latitude), 4326)::geography,
            ST_SetSRID(ST_MakePoint(p_longitude, p_latitude), 4326)::geography
        ) AS distance_meters,
        COALESCE(AVG(r.rating), 0)::NUMERIC(3, 2) as average_rating
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
        s.id,
        s.name,
        s.type,
        s.address,
        s.is_open,
        s.opening_time,
        s.closing_time,
        s.shop_latitude,
        s.shop_longitude
    ORDER BY
        distance_meters;
END;
$;