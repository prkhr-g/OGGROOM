CREATE OR REPLACE FUNCTION public.create_shop_and_owner(
    p_user_id uuid,
    owner_name text,
    owner_email text,
    owner_phone text,
    shop_name text,
    shop_type text,
    shop_address text,
    shop_latitude double precision,
    shop_longitude double precision,
    opening_time time,
    closing_time time
)
RETURNS void AS $$
DECLARE
  new_shop_id uuid;
BEGIN
  -- 1. Create the shop first, as it has no dependencies.
  INSERT INTO public.shops (name, type, address, shop_latitude, shop_longitude, opening_time, closing_time, email, phone)
  VALUES (shop_name, shop_type, shop_address, shop_latitude, shop_longitude, opening_time, closing_time, owner_email, owner_phone)
  RETURNING id INTO new_shop_id;

  -- 2. Create the shop_owner, linking them to the new shop and the authenticated user.
  INSERT INTO public.shop_owners (id, name, email, phone, shop_id)
  VALUES (p_user_id, owner_name, owner_email, owner_phone, new_shop_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
