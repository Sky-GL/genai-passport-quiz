-- 動作確認用のサンプル単語カード
-- Supabase SQL Editorで、以下の <YOUR_USER_ID> を auth.users のご自身のIDに置き換えて実行してください
insert into vocab_cards (user_id, front, back) values
  ('<YOUR_USER_ID>', 'reimburse', '（費用などを）払い戻す　例: The company will reimburse your travel expenses.'),
  ('<YOUR_USER_ID>', 'unanimously', '満場一致で　例: The proposal was approved unanimously.'),
  ('<YOUR_USER_ID>', 'inventory', '在庫、棚卸資産　例: We need to check the inventory before the shipment.'),
  ('<YOUR_USER_ID>', 'negotiate', '交渉する　例: They negotiated a better contract with the supplier.'),
  ('<YOUR_USER_ID>', 'subsidiary', '子会社　例: The subsidiary reported strong growth this quarter.');
