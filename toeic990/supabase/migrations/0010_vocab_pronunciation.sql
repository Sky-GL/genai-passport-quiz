-- 単語カードに発音記号(米国英語のIPA)を追加
alter table vocab_cards add column if not exists pronunciation text;
