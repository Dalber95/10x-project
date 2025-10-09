-- Migration: Create generation_error_logs table
-- Purpose: Store error logs from AI generation attempts for debugging and monitoring
-- Affected tables: generation_error_logs
-- Dependencies: Requires Supabase Auth (users table)
-- Special considerations: Includes RLS policies for user data isolation and error tracking

-- create the generation_error_logs table to track ai generation failures
create table public.generation_error_logs (
    id bigserial primary key,
    user_id uuid not null references auth.users(id) on delete cascade,
    model varchar not null,
    source_text_hash varchar not null,
    source_text_length integer not null check (source_text_length between 1000 and 10000),
    error_code varchar(100) not null,
    error_message text not null,
    created_at timestamptz not null default now()
);

-- create index on user_id for efficient user-specific queries
create index idx_generation_error_logs_user_id on public.generation_error_logs(user_id);

-- create index on error_code for efficient error analysis queries
create index idx_generation_error_logs_error_code on public.generation_error_logs(error_code);

-- create index on created_at for efficient time-based queries
create index idx_generation_error_logs_created_at on public.generation_error_logs(created_at);

-- enable row level security on generation_error_logs table
alter table public.generation_error_logs enable row level security;

-- create rls policy for authenticated users to select their own error logs
create policy "authenticated_users_select_own_error_logs" on public.generation_error_logs
    for select
    to authenticated
    using (auth.uid() = user_id);

-- create rls policy for authenticated users to insert their own error logs
create policy "authenticated_users_insert_own_error_logs" on public.generation_error_logs
    for insert
    to authenticated
    with check (auth.uid() = user_id);

-- create rls policy for authenticated users to update their own error logs
create policy "authenticated_users_update_own_error_logs" on public.generation_error_logs
    for update
    to authenticated
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);

-- create rls policy for authenticated users to delete their own error logs
create policy "authenticated_users_delete_own_error_logs" on public.generation_error_logs
    for delete
    to authenticated
    using (auth.uid() = user_id);

-- deny all access to anonymous users for generation_error_logs table
create policy "deny_anon_select_error_logs" on public.generation_error_logs
    for select
    to anon
    using (false);

create policy "deny_anon_insert_error_logs" on public.generation_error_logs
    for insert
    to anon
    with check (false);

create policy "deny_anon_update_error_logs" on public.generation_error_logs
    for update
    to anon
    using (false);

create policy "deny_anon_delete_error_logs" on public.generation_error_logs
    for delete
    to anon
    using (false);

