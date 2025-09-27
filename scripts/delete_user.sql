
CREATE OR REPLACE FUNCTION delete_user()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Delete the user from auth.users, which will cascade to other tables
  DELETE FROM auth.users WHERE id = auth.uid();
END;
$$;
