-- TOEIC難易度ランク(星1〜5、1が易しい/5が難しい)のカラムを追加
alter table vocab_cards add column if not exists toeic_level smallint check (toeic_level between 1 and 5);
