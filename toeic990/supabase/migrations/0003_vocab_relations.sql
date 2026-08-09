-- 単語の関係性理解を深めるためのカラムを追加
-- category: テーマ別学習のためのカテゴリラベル
-- related_words: 類義語・関連語（カンマ区切り）
-- collocation: よく使われる語句パターン
alter table vocab_cards add column if not exists category text;
alter table vocab_cards add column if not exists related_words text;
alter table vocab_cards add column if not exists collocation text;

create index if not exists vocab_cards_user_category_idx on vocab_cards (user_id, category);
