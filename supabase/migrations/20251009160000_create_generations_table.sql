-- Migration: Create generations table
-- Purpose: Store AI generation metadata and statistics for flashcard creation
-- Affected tables: generations
-- Dependencies: Requires Supabase Auth (users table)
-- Special considerations: Includes RLS policies for user data isolation

-- create the generations table to track ai generation sessions
create table public.generations (
    id bigserial primary key,
    user_id uuid not null references auth.users(id) on delete cascade,
    model varchar not null,
    generated_count integer not null,
    accepted_unedited_count integer,
    accepted_edited_count integer,
    source_text_hash varchar not null,
    source_text_length integer not null check (source_text_length between 1000 and 10000),
    generation_duration integer not null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- create index on user_id for efficient user-specific queries
create index idx_generations_user_id on public.generations(user_id);

-- enable row level security on generations table
alter table public.generations enable row level security;

-- create rls policy for authenticated users to select their own generations
create policy "authenticated_users_select_own_generations" on public.generations
    for select
    to authenticated
    using (auth.uid() = user_id);

-- create rls policy for authenticated users to insert their own generations
create policy "authenticated_users_insert_own_generations" on public.generations
    for insert
    to authenticated
    with check (auth.uid() = user_id);

-- create rls policy for authenticated users to update their own generations
create policy "authenticated_users_update_own_generations" on public.generations
    for update
    to authenticated
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);

-- create rls policy for authenticated users to delete their own generations
create policy "authenticated_users_delete_own_generations" on public.generations
    for delete
    to authenticated
    using (auth.uid() = user_id);

-- deny all access to anonymous users for generations table
create policy "deny_anon_select_generations" on public.generations
    for select
    to anon
    using (false);

create policy "deny_anon_insert_generations" on public.generations
    for insert
    to anon
    with check (false);

create policy "deny_anon_update_generations" on public.generations
    for update
    to anon
    using (false);

create policy "deny_anon_delete_generations" on public.generations
    for delete
    to anon
    using (false);

