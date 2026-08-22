-- 「簡単」判定した単語を今後の出題対象から除外するためのフラグ
alter table vocab_cards add column if not exists excluded boolean not null default false;
