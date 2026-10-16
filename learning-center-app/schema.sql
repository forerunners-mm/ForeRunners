-- Run once in Supabase SQL editor; only authenticated users can access their own records.
create table if not exists public.progress(learner_id uuid not null references auth.users(id) on delete cascade,course_id text not null,completed boolean not null default false,primary key(learner_id,course_id));
create table if not exists public.submissions(id uuid primary key default gen_random_uuid(),learner_id uuid not null references auth.users(id) on delete cascade,course_id text not null,content text not null check(char_length(content) between 80 and 20000),status text not null default 'pending' check(status in ('pending','reviewed','needs_revision')),score integer check(score between 0 and 100),submitted_at timestamptz not null default now());
create table if not exists public.certificates(id uuid primary key default gen_random_uuid(),learner_id uuid not null references auth.users(id) on delete cascade,course_id text not null,certificate_number text unique not null,issued_at timestamptz not null default now(),approved_by uuid not null references auth.users(id));
alter table public.progress enable row level security;alter table public.submissions enable row level security;alter table public.certificates enable row level security;
create policy "read own progress" on public.progress for select to authenticated using(learner_id=auth.uid());
create policy "insert own progress" on public.progress for insert to authenticated with check(learner_id=auth.uid());
create policy "update own progress" on public.progress for update to authenticated using(learner_id=auth.uid()) with check(learner_id=auth.uid());
create policy "read own assignments" on public.submissions for select to authenticated using(learner_id=auth.uid());
create policy "submit own assignments" on public.submissions for insert to authenticated with check(learner_id=auth.uid() and status='pending' and score is null);
create policy "read own certificates" on public.certificates for select to authenticated using(learner_id=auth.uid());
-- No public grade/certificate write policies. Staff backend required.
