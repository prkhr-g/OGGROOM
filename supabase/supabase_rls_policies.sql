-- RLS Policy for inserting reviews
-- This policy ensures that a user can only insert a review for their own completed booking.

-- To apply this policy in your Supabase dashboard:
-- 1. Go to Authentication -> Policies.
-- 2. Select the 'reviews' table.
-- 3. Create a new policy for INSERT.
-- 4. Use the following expression for the 'WITH CHECK' condition.

CREATE POLICY "Customers can insert reviews for their own completed bookings."
ON public.reviews
FOR INSERT
WITH CHECK (
  (auth.uid() = customer_id) AND
  (EXISTS (
    SELECT 1
    FROM public.bookings
    WHERE
      bookings.id = reviews.booking_id AND
      bookings.customer_id = auth.uid() AND
      bookings.status = 'completed'::text
  ))
);
