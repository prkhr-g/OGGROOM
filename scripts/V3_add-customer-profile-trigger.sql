
-- Function to create a customer profile when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if a customer profile already exists for the new user
  IF NOT EXISTS (SELECT 1 FROM public.customers WHERE id = NEW.id) THEN
    -- Insert a new customer record using the user''s ID, email, and name from metadata
    INSERT INTO public.customers (id, email, name)
    VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'name');
  END IF;
  RETURN NEW;
END;
$$;

-- Trigger to execute the function after a new user is created
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();

-- Grant usage on the sequence for the bookings table to the authenticated role
GRANT USAGE, SELECT ON SEQUENCE public.bookings_id_seq TO authenticated;
