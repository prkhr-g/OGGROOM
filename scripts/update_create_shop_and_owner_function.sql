CREATE OR REPLACE FUNCTION public.create_shop_and_owner(
    owner_name text,
    owner_email text,
    owner_phone text,
    shop_name text,
    shop_type text,
    shop_address text,
    shop_latitude double precision, -- New parameter
    shop_longitude double precision, -- New parameter
    opening_time text,
    closing_time text
)
RETURNS void AS $
DECLARE
    new_shop_owner_id uuid;
BEGIN
    INSERT INTO public.shop_owners (
        first_name,
        email,
        phone_number,
        shop_name,
        shop_type,
        shop_address,
        shop_latitude,
        shop_longitude,
        shop_opening_hours,
        shop_closing_hours,
        shop_owner_id
    ) VALUES (
        owner_name,
        owner_email,
        owner_phone,
        shop_name,
        shop_type,
        shop_address,
        shop_latitude,
        shop_longitude,
        opening_time::jsonb,
        closing_time::jsonb,
        auth.uid()
    )
    RETURNING id INTO new_shop_owner_id;

END;
$ LANGUAGE plpgsql SECURITY DEFINER;