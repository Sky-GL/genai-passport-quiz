-- 語源・派生語族(語源から派生した関連語)のカラムを追加
alter table vocab_cards add column if not exists etymology text;
alter table vocab_cards add column if not exists word_family text;
