-- 一度でも誤答したことがあるかを記録するフラグ。
-- 現在は正解していても、このフラグがtrueの問題はたまに苦手復習に再出題する
alter table grammar_answers add column if not exists ever_incorrect boolean not null default false;
