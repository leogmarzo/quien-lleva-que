-- Quién Lleva Qué — initial schema, RLS and guest-delete RPCs.

create extension if not exists pgcrypto;

-- ============================================================
-- Tables
-- ============================================================

create table public.events (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  event_at timestamptz null,
  description text null,
  owner_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create index events_owner_id_idx on public.events (owner_id);
create index events_slug_idx on public.events (slug);

create table public.items (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  name text not null,
  emoji text not null default '📌',
  notes text null,
  created_by_user_id uuid null references auth.users(id) on delete set null,
  created_by_guest_name text null,
  created_at timestamptz not null default now(),
  constraint items_creator_xor check (
    (created_by_user_id is not null and created_by_guest_name is null) or
    (created_by_user_id is null and created_by_guest_name is not null)
  )
);

create index items_event_id_idx on public.items (event_id);

create table public.claims (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references public.items(id) on delete cascade,
  user_id uuid null references auth.users(id) on delete set null,
  guest_name text null,
  created_at timestamptz not null default now(),
  constraint claims_claimer_xor check (
    (user_id is not null and guest_name is null) or
    (user_id is null and guest_name is not null)
  )
);

create index claims_item_id_idx on public.claims (item_id);
create unique index claims_uniq_user on public.claims (item_id, user_id) where user_id is not null;
create unique index claims_uniq_guest on public.claims (item_id, guest_name) where guest_name is not null;

-- ============================================================
-- RLS
-- ============================================================

alter table public.events  enable row level security;
alter table public.items   enable row level security;
alter table public.claims  enable row level security;

-- ----- events -----
create policy events_select_public
  on public.events for select
  using (true);

create policy events_insert_owner
  on public.events for insert
  with check (auth.uid() = owner_id);

create policy events_update_owner
  on public.events for update
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

create policy events_delete_owner
  on public.events for delete
  using (auth.uid() = owner_id);

-- ----- items -----
create policy items_select_public
  on public.items for select
  using (true);

-- Logged-in users: insert with their auth.uid() as creator.
create policy items_insert_user
  on public.items for insert
  with check (
    auth.uid() is not null
    and created_by_user_id = auth.uid()
    and created_by_guest_name is null
  );

-- Anonymous (guest) users: insert with guest_name set, no user_id.
create policy items_insert_guest
  on public.items for insert
  with check (
    auth.uid() is null
    and created_by_user_id is null
    and created_by_guest_name is not null
    and length(trim(created_by_guest_name)) > 0
  );

-- Authenticated users can delete only items they created.
create policy items_delete_user
  on public.items for delete
  using (created_by_user_id = auth.uid());

-- No update policy in v1 (item editing is out of scope).

-- ----- claims -----
create policy claims_select_public
  on public.claims for select
  using (true);

create policy claims_insert_user
  on public.claims for insert
  with check (
    auth.uid() is not null
    and user_id = auth.uid()
    and guest_name is null
  );

create policy claims_insert_guest
  on public.claims for insert
  with check (
    auth.uid() is null
    and user_id is null
    and guest_name is not null
    and length(trim(guest_name)) > 0
  );

create policy claims_delete_user
  on public.claims for delete
  using (user_id = auth.uid());

-- ============================================================
-- RPCs for guest-owned row deletion
-- (RLS can't trust a client-supplied guest_name, so these are
-- SECURITY DEFINER functions with explicit name matching.)
-- ============================================================

create or replace function public.delete_item_as_guest(p_item_id uuid, p_guest_name text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  delete from public.items
   where id = p_item_id
     and created_by_user_id is null
     and created_by_guest_name = p_guest_name;
end;
$$;

create or replace function public.delete_claim_as_guest(p_claim_id uuid, p_guest_name text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  delete from public.claims
   where id = p_claim_id
     and user_id is null
     and guest_name = p_guest_name;
end;
$$;

grant execute on function public.delete_item_as_guest(uuid, text) to anon, authenticated;
grant execute on function public.delete_claim_as_guest(uuid, text) to anon, authenticated;

-- ============================================================
-- Enable Realtime publication on items and claims so the
-- frontend can subscribe to live changes.
-- ============================================================

alter publication supabase_realtime add table public.items;
alter publication supabase_realtime add table public.claims;
