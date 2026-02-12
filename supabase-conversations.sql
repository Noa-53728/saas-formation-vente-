-- Table des conversations (1 par couple acheteur + vendeur + formation)
-- À exécuter dans Supabase > SQL Editor > New query

create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  buyer_id uuid not null references public.profiles(id) on delete cascade,
  seller_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz default now() not null,
  unique(course_id, buyer_id, seller_id)
);

-- RLS
alter table public.conversations enable row level security;

-- Les participants (buyer ou seller) peuvent lire leur conversation
create policy "participants read conversation"
  on public.conversations for select
  using (auth.uid() = buyer_id or auth.uid() = seller_id);

-- Buyer ou seller peut créer une conversation
create policy "buyer or seller insert conversation"
  on public.conversations for insert
  with check (auth.uid() = buyer_id or auth.uid() = seller_id);
