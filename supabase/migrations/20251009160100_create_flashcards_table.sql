-- Migration: Create flashcards table with trigger and indexes
-- Purpose: Store user flashcards with AI generation tracking and automatic timestamp updates
-- Affected tables: flashcards
-- Dependencies: Requires generations table and Supabase Auth (users table)
-- Special considerations: Includes automatic updated_at trigger and RLS policies

-- create the flashcards table to store user flashcards
create table public.flashcards (
    id bigserial primary key,
    front varchar(200) not null,
    back varchar(500) not null,
    source varchar not null check (source in ('ai-full', 'ai-edited', 'manual')),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    generation_id bigint references public.generations(id) on delete set null,
    user_id uuid not null references auth.users(id) on delete cascade
);

-- create index on user_id for efficient user-specific queries
create index idx_flashcards_user_id on public.flashcards(user_id);

-- create index on generation_id for efficient generation-related queries
create index idx_flashcards_generation_id on public.flashcards(generation_id);

-- create function to automatically update the updated_at column
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

-- create trigger to automatically update updated_at on flashcards table modifications
create trigger trigger_update_flashcards_updated_at
    before update on public.flashcards
    for each row
    execute function public.update_updated_at_column();

-- enable row level security on flashcards table
alter table public.flashcards enable row level security;

-- create rls policy for authenticated users to select their own flashcards
create policy "authenticated_users_select_own_flashcards" on public.flashcards
    for select
    to authenticated
    using (auth.uid() = user_id);

-- create rls policy for authenticated users to insert their own flashcards
create policy "authenticated_users_insert_own_flashcards" on public.flashcards
    for insert
    to authenticated
    with check (auth.uid() = user_id);

-- create rls policy for authenticated users to update their own flashcards
create policy "authenticated_users_update_own_flashcards" on public.flashcards
    for update
    to authenticated
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);

-- create rls policy for authenticated users to delete their own flashcards
create policy "authenticated_users_delete_own_flashcards" on public.flashcards
    for delete
    to authenticated
    using (auth.uid() = user_id);

-- deny all access to anonymous users for flashcards table
create policy "deny_anon_select_flashcards" on public.flashcards
    for select
    to anon
    using (false);

create policy "deny_anon_insert_flashcards" on public.flashcards
    for insert
    to anon
    with check (false);

create policy "deny_anon_update_flashcards" on public.flashcards
    for update
    to anon
    using (false);

create policy "deny_anon_delete_flashcards" on public.flashcards
    for delete
    to anon
    using (false);

