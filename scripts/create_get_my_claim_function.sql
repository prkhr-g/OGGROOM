create or replace function public.get_my_claim(claim text)
returns text
language sql
stable
as $$
  select nullif(current_setting('request.jwt.claims', true)::jsonb ->> claim, '')::text;
$$;