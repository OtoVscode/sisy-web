-- ==========================================================================
-- Studio Glow · Base de datos de citas en Supabase (plan gratis)
-- Cómo usarlo: Supabase → tu proyecto → SQL Editor → pega todo esto → Run.
-- Después: en assets/booking.js pon storage: 'supabase', supabaseUrl y
-- supabaseAnonKey (Project Settings → API), y crea el usuario de la dueña en
-- Authentication → Users → Add user (email + contraseña).
-- ==========================================================================

create table if not exists public.appointments (
  id            text primary key,
  date          date not null,
  start         text not null,          -- 'HH:MM'
  "end"         text not null,          -- 'HH:MM'
  service_id    text not null,
  service_name  text not null,
  duration      int  not null,
  price         numeric not null,
  client_name   text not null check (char_length(client_name) between 1 and 80),
  client_phone  text not null check (char_length(client_phone) between 7 and 30),
  note          text default '',
  lang          text default 'es',
  status        text not null default 'confirmed' check (status in ('confirmed', 'cancelled')),
  created_at    timestamptz not null default now()
);

create table if not exists public.blocks (
  id      text primary key,
  date    date not null,
  start   text not null,
  "end"   text not null,
  reason  text default ''
);

alter table public.appointments enable row level security;
alter table public.blocks enable row level security;

-- Las clientas (anónimas) solo pueden CREAR citas confirmadas; no pueden leer datos de otras.
create policy "clientas crean citas" on public.appointments
  for insert to anon with check (status = 'confirmed');

-- La dueña (usuario con sesión) ve y gestiona todo.
create policy "duena lee citas" on public.appointments for select to authenticated using (true);
create policy "duena edita citas" on public.appointments for update to authenticated using (true);
create policy "duena gestiona bloqueos" on public.blocks for all to authenticated using (true) with check (true);

-- Vista pública con SOLO los horarios ocupados (sin nombres ni teléfonos),
-- para pintar el calendario de la web.
create or replace view public.busy_slots
with (security_invoker = false) as
  select date, start, "end" from public.appointments where status = 'confirmed'
  union all
  select date, start, "end" from public.blocks;

grant select on public.busy_slots to anon, authenticated;
