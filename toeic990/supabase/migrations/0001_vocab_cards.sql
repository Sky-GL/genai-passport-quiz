-- 単語・文法SRS学習用カードテーブル
create table if not exists vocab_cards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  front text not null,
  back text not null,
  -- ts-fsrsのCard型に対応するフィールド
  due timestamptz not null default now(),
  stability double precision not null default 0,
  difficulty double precision not null default 0,
  elapsed_days integer not null default 0,
  scheduled_days integer not null default 0,
  reps integer not null default 0,
  lapses integer not null default 0,
  state smallint not null default 0,
  last_review timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists vocab_cards_user_due_idx on vocab_cards (user_id, due);

alter table vocab_cards enable row level security;

create policy "vocab_cards_select_own" on vocab_cards
  for select using (auth.uid() = user_id);

create policy "vocab_cards_insert_own" on vocab_cards
  for insert with check (auth.uid() = user_id);

create policy "vocab_cards_update_own" on vocab_cards
  for update using (auth.uid() = user_id);

create policy "vocab_cards_delete_own" on vocab_cards
  for delete using (auth.uid() = user_id);
