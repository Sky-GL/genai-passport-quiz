-- TOEIC Part 5形式(空所補充)の出題文。対象語を「___」に置き換えた英文を保持する
alter table vocab_cards
  add column if not exists quiz_sentence text;

-- 例文に原形がそのまま含まれる語は、既存の例文から機械的に空所化する
update vocab_cards
set quiz_sentence = regexp_replace(
      trim(split_part(back, '　例:', 2)),
      '\m' || front || '\M',
      '___',
      'gi'
    )
where quiz_sentence is null
  and trim(split_part(back, '　例:', 2)) <> ''
  and trim(split_part(back, '　例:', 2)) ~* ('\m' || front || '\M');

-- 例文が活用形(incurred, amenities など)のため機械置換できない語は、原形が入る文を個別に用意する
update vocab_cards as v
set quiz_sentence = s.sentence
from (values
  ('accrue',        'Interest will ___ monthly on any outstanding balance.'),
  ('amenity',       'The hotel''s most popular ___ is the rooftop swimming pool.'),
  ('amortize',      'The company plans to ___ the cost of the equipment over five years.'),
  ('benchmark',     'The report uses last year''s sales figures as a ___ for growth.'),
  ('consolidate',   'Management decided to ___ the two departments into a single team.'),
  ('deprecate',     'The vendor will ___ the old API at the end of the year.'),
  ('deviate',       'Employees must not ___ from the approved safety procedures.'),
  ('disbursement',  'The finance team will process the final ___ to the vendor on Friday.'),
  ('disrupt',       'Heavy snow may ___ deliveries throughout the region this week.'),
  ('encrypt',       'The system will ___ all customer data before storing it.'),
  ('envisage',      'Analysts ___ steady growth in the Asian market next year.'),
  ('fabricate',     'The supplier will ___ the replacement parts at its overseas factory.'),
  ('incur',         'Late payments will ___ an additional service charge.'),
  ('malfunction',   'If the printer should ___ again, please contact the help desk.'),
  ('negotiate',     'The team hopes to ___ a better contract with the supplier.'),
  ('pallet',        'Each ___ of goods must be labeled before it leaves the warehouse.'),
  ('perk',          'Free gym membership is a ___ that many employees value highly.'),
  ('pivot',         'The firm decided to ___ from hardware to software services.'),
  ('proliferate',   'Online retailers continue to ___ in the domestic market.'),
  ('recall',        'The manufacturer may ___ thousands of vehicles due to a safety issue.'),
  ('reconcile',     'The accountant will ___ the bank statements at the end of the month.'),
  ('replenish',     'Staff members ___ the shelves every night after the store closes.'),
  ('reprimand',     'The supervisor had to ___ the employee for missing the deadline.'),
  ('sanction',      'The government imposed a trade ___ on imported steel.'),
  ('scrutinize',    'Auditors will ___ the company''s financial records next week.'),
  ('segment',       'The marketing team will ___ its customers by age group.'),
  ('specification', 'Every technical ___ in the contract must be reviewed by engineering.'),
  ('stakeholder',   'Every ___ must be consulted before the plan is finalized.'),
  ('stipulate',     'The revised terms ___ that payment is due within 30 days.'),
  ('streamline',    'The company hopes to ___ its production process to cut costs.'),
  ('tenant',        'The new ___ signed a three-year lease for the office space.')
) as s(front, sentence)
where lower(v.front) = s.front
  and v.quiz_sentence is null;
