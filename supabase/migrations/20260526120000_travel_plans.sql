-- VuraPet Travel Planner: saved plans per pet
create table if not exists public.travel_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  pet_id uuid not null references public.pets (id) on delete cascade,
  from_country text not null,
  to_country text not null,
  travel_date date,
  species text,
  breed text,
  pet_weight_kg numeric,
  snub_nosed boolean not null default false,
  checklist_json jsonb not null default '[]'::jsonb,
  timeline_json jsonb not null default '[]'::jsonb,
  readiness_score integer not null default 0,
  status text not null default 'active' check (status in ('active', 'completed', 'cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists travel_plans_pet_id_idx on public.travel_plans (pet_id);
create index if not exists travel_plans_user_id_idx on public.travel_plans (user_id);

alter table public.travel_plans enable row level security;

create policy "Users can view own travel plans"
  on public.travel_plans for select
  using (auth.uid() = user_id);

create policy "Users can insert own travel plans"
  on public.travel_plans for insert
  with check (auth.uid() = user_id);

create policy "Users can update own travel plans"
  on public.travel_plans for update
  using (auth.uid() = user_id);

create policy "Users can delete own travel plans"
  on public.travel_plans for delete
  using (auth.uid() = user_id);

create or replace function public.set_travel_plans_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists travel_plans_updated_at on public.travel_plans;
create trigger travel_plans_updated_at
  before update on public.travel_plans
  for each row execute function public.set_travel_plans_updated_at();
