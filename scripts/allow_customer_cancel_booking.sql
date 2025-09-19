CREATE POLICY "Allow customer to cancel their own booking"
ON public.bookings
FOR UPDATE
USING (auth.uid() = customer_id)
WITH CHECK (status = 'cancelled');
