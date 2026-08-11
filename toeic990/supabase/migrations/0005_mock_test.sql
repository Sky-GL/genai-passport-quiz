-- 模試形式演習(Part5・6)用テーブル
create table if not exists mock_test_passages (
  id uuid primary key default gen_random_uuid(),
  part text not null check (part in ('part6')),
  title text not null,
  passage_text text not null,
  created_at timestamptz not null default now()
);

alter table mock_test_passages enable row level security;

create policy "mock_test_passages_select_authenticated" on mock_test_passages
  for select using (auth.uid() is not null);

create table if not exists mock_test_questions (
  id uuid primary key default gen_random_uuid(),
  part text not null check (part in ('part5', 'part6')),
  passage_id uuid references mock_test_passages(id) on delete cascade,
  blank_number integer,
  question_text text not null,
  choice_a text not null,
  choice_b text not null,
  choice_c text not null,
  choice_d text not null,
  correct_choice text not null check (correct_choice in ('A', 'B', 'C', 'D')),
  explanation text not null,
  order_index integer not null default 0,
  created_at timestamptz not null default now()
);

alter table mock_test_questions enable row level security;

create policy "mock_test_questions_select_authenticated" on mock_test_questions
  for select using (auth.uid() is not null);

-- Part5: 短文穴埋め 10問
insert into mock_test_questions (part, question_text, choice_a, choice_b, choice_c, choice_d, correct_choice, explanation, order_index) values
  ('part5', 'All employees must ___ the safety training before starting their shift.', 'attend', 'attending', 'attendance', 'attended', 'A', '助動詞mustの後は動詞の原形が続く。attend(出席する)が正解。', 1),
  ('part5', 'The quarterly report was submitted ___ than expected.', 'early', 'earlier', 'earliest', 'earliness', 'B', 'than expectedと比較しているので比較級earlierが正解。', 2),
  ('part5', 'Please ensure that the invoice is ___ before submitting it for payment.', 'accurate', 'accurately', 'accuracy', 'accurateness', 'A', 'be動詞isの補語となるのは形容詞。accurate(正確な)が正解。', 3),
  ('part5', 'The new marketing strategy has proven ___ effective than the previous one.', 'far more', 'far most', 'so more', 'very more', 'A', '比較級を強調するのはfar more。「はるかに効果的」という意味。', 4),
  ('part5', '___ the delay, the shipment arrived in good condition.', 'Despite', 'Although', 'However', 'Because', 'A', '後ろに名詞句(the delay)が続くので前置詞Despiteが正解。Althoughは節を伴う接続詞。', 5),
  ('part5', 'Employees are encouraged to submit their expense reports ___ the end of each month.', 'until', 'by', 'since', 'during', 'B', '「〜までに」という期限を表す前置詞はby。', 6),
  ('part5', 'The CEO ___ the merger during yesterday''s press conference.', 'announce', 'announced', 'announcing', 'to announce', 'B', '昨日の出来事なので過去形announcedが正解。', 7),
  ('part5', 'It is essential that all staff ___ familiar with the new software before the rollout.', 'become', 'becomes', 'became', 'becoming', 'A', 'It is essential that節の中では仮定法現在(動詞の原形)を使う。becomeが正解。', 8),
  ('part5', 'The warehouse ___ renovated last month to increase storage capacity.', 'was', 'were', 'is', 'has', 'A', '主語the warehouseは単数、last monthという過去の時点なので受動態の過去形was renovatedが正解。', 9),
  ('part5', 'Customers who register online will receive a discount ___ their first purchase.', 'at', 'in', 'on', 'for', 'C', '「初回購入時に」を表す定型表現は discount on one''s first purchase。', 10);

-- Part6: 長文穴埋め パッセージ1
with passage1 as (
  insert into mock_test_passages (part, title, passage_text) values
    ('part6', 'Office Relocation Notice',
    'Dear Team,

I am writing to inform you that our office will be relocating to a new building starting next month. The new location (1)___ better facilities and is more accessible by public transportation.

Please note that all employees must update their mailing address with HR by the end of this week. If you have any questions, please do not (2)___ to contact the facilities department.

We appreciate your patience during this transition and look forward to (3)___ you in the new space. The moving company will begin transporting furniture and equipment (4)___ the weekend to minimize disruption to daily operations.

Best regards,
Facilities Management')
  returning id
)
insert into mock_test_questions (part, passage_id, blank_number, question_text, choice_a, choice_b, choice_c, choice_d, correct_choice, explanation, order_index)
select 'part6', passage1.id, 1, '空欄(1)に入る最も適切な語を選びなさい。', 'offer', 'offers', 'offering', 'offered', 'B', '主語The new locationは単数で現在の事実を述べているので、現在形三人称単数のoffersが正解。', 11
from passage1
union all
select 'part6', passage1.id, 2, '空欄(2)に入る最も適切な語を選びなさい。', 'hesitate', 'hesitant', 'hesitation', 'hesitating', 'A', 'do not の後は動詞の原形が続く。"do not hesitate to ~"で「遠慮なく〜する」という定型表現。', 12
from passage1
union all
select 'part6', passage1.id, 3, '空欄(3)に入る最も適切な語を選びなさい。', 'welcome', 'welcoming', 'welcomed', 'welcomes', 'B', '"look forward to"のtoは前置詞なので後ろは動名詞。welcomingが正解。', 13
from passage1
union all
select 'part6', passage1.id, 4, '空欄(4)に入る最も適切な語を選びなさい。', 'during', 'while', 'for', 'since', 'A', '後ろに名詞句(the weekend)が続くので前置詞duringが正解。', 14
from passage1;

-- Part6: 長文穴埋め パッセージ2
with passage2 as (
  insert into mock_test_passages (part, title, passage_text) values
    ('part6', 'Quality Assurance Memo',
    'To: All Staff
From: Quality Assurance
Subject: Product Inspection Update

Effective immediately, all outgoing shipments (1)___ inspected before they leave the warehouse. This new procedure is designed to reduce the number of customer complaints (2)___ we have received over the past quarter.

Each inspector will be responsible for checking a random sample of items from every batch. (3)___ any defects are found, the entire batch must be set aside for further review.

We understand that this additional step may (4)___ the shipping schedule slightly, but we believe the improvement in product quality will be worth the extra time.

Thank you for your cooperation.

Quality Assurance Team')
  returning id
)
insert into mock_test_questions (part, passage_id, blank_number, question_text, choice_a, choice_b, choice_c, choice_d, correct_choice, explanation, order_index)
select 'part6', passage2.id, 1, '空欄(1)に入る最も適切な語を選びなさい。', 'must be', 'must', 'are must', 'must have', 'A', '出荷物は「検査される」対象なので受動態。助動詞must + be + 過去分詞の形。', 15
from passage2
union all
select 'part6', passage2.id, 2, '空欄(2)に入る最も適切な語を選びなさい。', 'that', 'who', 'whom', 'whose', 'A', '先行詞complaints(物)を受ける関係代名詞はthat(またはwhich)。', 16
from passage2
union all
select 'part6', passage2.id, 3, '空欄(3)に入る最も適切な語を選びなさい。', 'If', 'Unless', 'Although', 'Despite', 'A', '「もし欠陥が見つかれば」という条件を表すIfが正解。', 17
from passage2
union all
select 'part6', passage2.id, 4, '空欄(4)に入る最も適切な語を選びなさい。', 'delay', 'delaying', 'delayed', 'to delay', 'A', '助動詞mayの後は動詞の原形が続く。delayが正解。', 18
from passage2;
