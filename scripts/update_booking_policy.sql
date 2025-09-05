DO $$
BEGIN
    -- Drop the policy if it exists
    EXECUTE 'DROP POLICY IF EXISTS "Allow owners to manage shop data" ON public.bookings;';

    -- Create the policy
    EXECUTE 'CREATE POLICY "Allow owners to manage shop data"
    ON public.bookings FOR ALL
    TO authenticated
    USING (
      is_shop_owner(shop_id)
    )
    WITH CHECK (
      is_shop_owner(shop_id) AND new.status IN (''''confirmed'''', ''''cancelled'''')
    );';
END
$$;