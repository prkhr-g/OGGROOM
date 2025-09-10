
CREATE POLICY "Allow public read access to all shops"
ON public.shops
FOR SELECT
USING (true);
