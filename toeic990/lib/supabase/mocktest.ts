import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Choice, MockTestSet } from "@/types/mocktest";

const PUBLIC_COLUMNS =
  "id, part, passage_id, blank_number, question_text, choice_a, choice_b, choice_c, choice_d, order_index";

export async function getMockTestSet(): Promise<MockTestSet> {
  const supabase = await createSupabaseServerClient();

  const [{ data: questions, error: qError }, { data: passages, error: pError }] = await Promise.all([
    supabase.from("mock_test_questions").select(PUBLIC_COLUMNS).order("order_index"),
    supabase.from("mock_test_passages").select("id, title, passage_text"),
  ]);

  if (qError) throw qError;
  if (pError) throw pError;

  return { questions: questions ?? [], passages: passages ?? [] };
}

export async function checkMockTestAnswer(
  questionId: string,
  selected: Choice
): Promise<{ isCorrect: boolean; correctChoice: Choice; explanation: string }> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("mock_test_questions")
    .select("correct_choice, explanation")
    .eq("id", questionId)
    .single();

  if (error || !data) throw error ?? new Error("問題が見つかりません");

  return {
    isCorrect: data.correct_choice === selected,
    correctChoice: data.correct_choice as Choice,
    explanation: data.explanation,
  };
}

export async function getCorrectAnswers(
  questionIds: string[]
): Promise<Map<string, { correctChoice: Choice; explanation: string; part: string }>> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("mock_test_questions")
    .select("id, correct_choice, explanation, part")
    .in("id", questionIds);

  if (error) throw error;

  const map = new Map<string, { correctChoice: Choice; explanation: string; part: string }>();
  for (const row of data ?? []) {
    map.set(row.id, {
      correctChoice: row.correct_choice as Choice,
      explanation: row.explanation,
      part: row.part,
    });
  }
  return map;
}
