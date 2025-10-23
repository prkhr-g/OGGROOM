CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if a customer profile already exists for the new user
  IF NOT EXISTS (SELECT 1 FROM public.customers WHERE id = NEW.id) THEN
    INSERT INTO public.customers (id, email, name, age, sex, phone, "location")
    VALUES (
      NEW.id,
      NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
      (NEW.raw_user_meta_data->>'age')::integer,
      NEW.raw_user_meta_data->>'sex',
      NEW.raw_user_meta_data->>'phone',
      NEW.raw_user_meta_data->>'location'
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;