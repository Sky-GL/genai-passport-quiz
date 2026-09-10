export type VocabCardRow = {
  id: string;
  user_id: string;
  front: string;
  back: string;
  due: string;
  stability: number;
  difficulty: number;
  elapsed_days: number;
  scheduled_days: number;
  reps: number;
  lapses: number;
  state: number;
  last_review: string | null;
  created_at: string;
  category: string | null;
  related_words: string | null;
  collocation: string | null;
  etymology: string | null;
  word_family: string | null;
  toeic_level: number | null;
  excluded: boolean;
  pronunciation: string | null;
  part_of_speech: string | null;
  // TOEIC Part5形式の出題文。対象語が「___」に置き換わっている
  quiz_sentence: string | null;
};
