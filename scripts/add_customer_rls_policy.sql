CREATE POLICY "Allow shop owners to view customers associated with their bookings"
ON public.customers FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.bookings
    WHERE bookings.customer_id = customers.id
    AND is_shop_owner(bookings.shop_id)
  )
);