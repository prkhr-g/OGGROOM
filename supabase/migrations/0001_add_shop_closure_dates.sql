-- Add columns for shop closure period
ALTER TABLE public.shops
ADD COLUMN closed_from DATE,
ADD COLUMN closed_to DATE;

-- Add a check constraint to ensure closed_from is before or on the same day as closed_to
ALTER TABLE public.shops
ADD CONSTRAINT closed_dates_check CHECK (closed_from <= closed_to);
