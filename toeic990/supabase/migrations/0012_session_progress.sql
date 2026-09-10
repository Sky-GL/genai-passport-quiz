-- 単語SRSのセッション進捗。1問回答するごとに1行INSERTし、
-- 未完了セッション(規定問題数に満たないセッション)を途中再開できるようにする
create table if not exists session_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  session_id uuid not null,
  card_id uuid not null references vocab_cards(id) on delete cascade,
  answered_at timestamptz not null default now(),
  is_correct boolean not null,
  unique (session_id, card_id)
);

-- 未完了セッションの検索(user_idで絞り、session_idごとの回答数を数える)用
create index if not exists session_progress_user_session_idx
  on session_progress (user_id, session_id, answered_at);

alter table session_progress enable row level security;

create policy "session_progress_select_own" on session_progress
  for select using (auth.uid() = user_id);

create policy "session_progress_insert_own" on session_progress
  for insert with check (auth.uid() = user_id);

create policy "session_progress_delete_own" on session_progress
  for delete using (auth.uid() = user_id);
