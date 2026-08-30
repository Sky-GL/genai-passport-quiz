-- 単語カードに品詞(名/動/形/副、複合は「動・名」のように併記)を追加
alter table vocab_cards add column if not exists part_of_speech text;
