-- 文法問題(4択)機能用テーブル
create table if not exists grammar_questions (
  id uuid primary key default gen_random_uuid(),
  category text not null,
  question_text text not null,
  choice_a text not null,
  choice_b text not null,
  choice_c text not null,
  choice_d text not null,
  correct_choice text not null check (correct_choice in ('A', 'B', 'C', 'D')),
  explanation text not null,
  created_at timestamptz not null default now()
);

-- 問題は全ユーザー共通のコンテンツ。ログインユーザーなら誰でも閲覧可能
alter table grammar_questions enable row level security;

create policy "grammar_questions_select_authenticated" on grammar_questions
  for select using (auth.uid() is not null);

-- ユーザーごとの解答履歴（同じ問題は再解答で上書き）
create table if not exists grammar_answers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  question_id uuid not null references grammar_questions(id) on delete cascade,
  selected_choice text not null,
  is_correct boolean not null,
  answered_at timestamptz not null default now(),
  unique (user_id, question_id)
);

alter table grammar_answers enable row level security;

create policy "grammar_answers_select_own" on grammar_answers
  for select using (auth.uid() = user_id);

create policy "grammar_answers_insert_own" on grammar_answers
  for insert with check (auth.uid() = user_id);

create policy "grammar_answers_update_own" on grammar_answers
  for update using (auth.uid() = user_id);

insert into grammar_questions (category, question_text, choice_a, choice_b, choice_c, choice_d, correct_choice, explanation) values
  ('関係詞', 'The committee, ___ decision is final, will announce the results tomorrow.', 'which', 'who', 'whose', 'whom', 'C', '先行詞 the committee の所有格を受ける関係代名詞 whose が正解。"committee''s decision" の意味になる。'),
  ('仮定法', 'If I ___ known about the meeting, I would have attended.', 'have', 'had', 'would have', 'has', 'B', '仮定法過去完了。If節はhad + 過去分詞、主節はwould have + 過去分詞の形。'),
  ('時制', 'By the time the manager arrives, we ___ the report.', 'will finish', 'will have finished', 'finish', 'finished', 'B', '未来のある時点までに完了している動作は未来完了形(will have + 過去分詞)で表す。'),
  ('前置詞', 'The proposal was rejected ___ several objections from the board.', 'despite', 'because', 'due', 'owing', 'A', 'despiteは前置詞として直接名詞句を続けられる。because/due/owingは単独では使えず、because of / due to / owing toの形が必要。'),
  ('品詞・語法', 'The company''s ___ growth exceeded expectations.', 'rapid', 'rapidly', 'rapidity', 'rapidness', 'A', '名詞growthを修飾するのは形容詞。rapid growth(急成長)が正しい形。'),
  ('比較', 'This model is far ___ efficient than the previous one.', 'more', 'most', 'much', 'very', 'A', '比較級efficientを強調するfarと共に使うのはmore(比較級を作る語)。'),
  ('受動態', 'The contract ___ by both parties before the deadline.', 'must sign', 'must be signed', 'must signed', 'must have sign', 'B', '契約書は「署名される」対象なので受動態。助動詞must + be + 過去分詞の形。'),
  ('分詞構文', '___ the budget carefully, the team decided to cut costs.', 'Reviewed', 'Review', 'Having reviewed', 'To reviewing', 'C', '主節より前に完了した動作を示す分詞構文はHaving + 過去分詞。'),
  ('接続詞', '___ the rain, the outdoor event proceeded as scheduled.', 'Despite', 'Although', 'Because', 'Unless', 'A', '後ろに名詞句(the rain)が続く場合は前置詞Despiteを使う。Althoughは節(主語+動詞)を伴う接続詞。'),
  ('助動詞', 'Employees ___ submit their timesheets by Friday.', 'must to', 'should to', 'are supposed to', 'can to', 'C', 'be supposed toで「〜することになっている」の意味。他の選択肢はmust/should/canの後にtoを続ける誤った形。'),
  ('関係詞', 'This is the department ___ handles customer complaints.', 'who', 'which', 'whom', 'whose', 'B', '先行詞the departmentは人ではないのでwhichを使う。関係代名詞が主語の役割をしている。'),
  ('仮定法', 'I wish I ___ more time to prepare for the presentation.', 'have', 'had', 'will have', 'has', 'B', 'I wish + 仮定法過去(had)で「〜であればいいのに」という現在の事実に反する願望を表す。'),
  ('時制', 'The new policy ___ effect since January.', 'has been in', 'is in', 'was in', 'will be in', 'A', 'sinceと共に使われるのは現在完了形。「1月からずっと効力を持っている」という継続を表す。'),
  ('前置詞', 'The report was submitted ___ the deadline.', 'on', 'in', 'at', 'by', 'D', '「(期限)までに」という意味の前置詞はby。締め切りに間に合わせて提出したことを表す。'),
  ('品詞・語法', 'Please handle this matter with ___.', 'confident', 'confidence', 'confidently', 'confide', 'B', '前置詞withの後には名詞が続く。confidence(自信、確信)が正解。'),
  ('比較', 'Of the three candidates, she has the ___ experience.', 'more', 'most', 'much', 'many', 'B', '3人の中で比較する最上級表現。the most experienceで「最も多くの経験」。'),
  ('受動態', 'The new office building ___ next spring.', 'will complete', 'will be completed', 'completes', 'is completing', 'B', 'ビルは「完成させられる」対象なので受動態。will be + 過去分詞で未来の受動態を表す。'),
  ('分詞構文', '___ in 1998, the company has grown steadily.', 'Found', 'Founding', 'Founded', 'To found', 'C', '会社は「設立された」対象なので受動の分詞構文Founded(= Having been founded)を使う。'),
  ('接続詞', 'You will not receive the refund ___ you return the item within 30 days.', 'unless', 'if', 'although', 'despite', 'A', 'unless(〜しない限り)は否定条件を表す接続詞。「30日以内に返品しない限り返金されない」の意味。'),
  ('助動詞', 'You ___ have called me earlier; I was worried.', 'should', 'must', 'can', 'will', 'A', 'should have + 過去分詞で「〜すべきだったのに(しなかった)」という過去への後悔・非難を表す。');
