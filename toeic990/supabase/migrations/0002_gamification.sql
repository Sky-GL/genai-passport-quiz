-- ゲーミフィケーション（連続記録・レベル・XP・日次学習量）用テーブル
create table if not exists user_stats (
  user_id uuid primary key references auth.users(id) on delete cascade,
  total_xp integer not null default 0,
  current_streak integer not null default 0,
  longest_streak integer not null default 0,
  last_study_date date,
  updated_at timestamptz not null default now()
);

create table if not exists daily_activity (
  user_id uuid not null references auth.users(id) on delete cascade,
  activity_date date not null,
  xp_earned integer not null default 0,
  cards_reviewed integer not null default 0,
  primary key (user_id, activity_date)
);

alter table user_stats enable row level security;
alter table daily_activity enable row level security;

create policy "user_stats_select_own" on user_stats
  for select using (auth.uid() = user_id);

create policy "daily_activity_select_own" on daily_activity
  for select using (auth.uid() = user_id);

-- user_stats/daily_activityへの書き込みはrecord_study_activity()経由のみ許可し、
-- クライアントからの直接insert/updateは許可しない（ポリシーを設定しないことで拒否される）

-- 1枚のカード採点ごとに呼び出す。XP加算・日次活動の集計・連続記録の更新をアトミックに行う。
create or replace function record_study_activity(p_xp integer)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_today date := current_date;
  v_next_streak integer;
begin
  if v_user_id is null then
    raise exception 'not authenticated';
  end if;

  insert into daily_activity (user_id, activity_date, xp_earned, cards_reviewed)
  values (v_user_id, v_today, p_xp, 1)
  on conflict (user_id, activity_date)
  do update set
    xp_earned = daily_activity.xp_earned + excluded.xp_earned,
    cards_reviewed = daily_activity.cards_reviewed + 1;

  insert into user_stats (user_id, total_xp, current_streak, longest_streak, last_study_date)
  values (v_user_id, p_xp, 1, 1, v_today)
  on conflict (user_id) do update set
    total_xp = user_stats.total_xp + p_xp,
    current_streak = case
      when user_stats.last_study_date = v_today then user_stats.current_streak
      when user_stats.last_study_date = v_today - 1 then user_stats.current_streak + 1
      else 1
    end,
    longest_streak = greatest(
      user_stats.longest_streak,
      case
        when user_stats.last_study_date = v_today then user_stats.current_streak
        when user_stats.last_study_date = v_today - 1 then user_stats.current_streak + 1
        else 1
      end
    ),
    last_study_date = v_today,
    updated_at = now();
end;
$$;

grant execute on function record_study_activity(integer) to authenticated;
