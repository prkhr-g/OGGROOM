-- Enable Row Level Security for the 'bookings' table
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Create a policy to allow shop owners to update booking status for their shop's bookings
DROP POLICY IF EXISTS "Allow shop owners to update booking status" ON public.bookings;
CREATE POLICY "Allow shop owners to update booking status"
ON public.bookings FOR UPDATE
TO authenticated -- Assuming shop owners are authenticated users
USING (
  EXISTS (
    SELECT 1
    FROM public.shops
    WHERE
      shops.id = bookings.shop_id AND shops.owner_id = auth.uid()
  )
)
WITH CHECK (
  new.status IN ('confirmed', 'cancelled')
);