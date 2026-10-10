-- 0002: safer public stock access, profile bootstrap, and starter categories.
begin;

-- Never expose exact on-hand/reserved inventory through direct public table reads.
revoke all on public.inventory from anon, authenticated;

-- Profile creation is tied to the auth account. User metadata can set a display name only;
-- authorization roles are always assigned by a trusted administrative process.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_display_name text;
begin
  v_display_name := left(coalesce(
    nullif(trim(new.raw_user_meta_data ->> 'display_name'), ''),
    nullif(split_part(coalesce(new.email, ''), '@', 1), ''),
    'Pengguna'
  ), 120);

  insert into public.profiles (id, display_name, role)
  values (new.id, v_display_name, 'buyer')
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

insert into public.categories (name, slug) values
  ('Pangan Segar', 'pangan-segar'),
  ('Kebutuhan Harian', 'kebutuhan-harian'),
  ('Peralatan & Bahan', 'peralatan-bahan'),
  ('Grosir & B2B', 'grosir-b2b')
on conflict (slug) do nothing;

commit;