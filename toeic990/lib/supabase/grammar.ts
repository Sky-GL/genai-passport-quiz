import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Choice, GrammarQuestionPublic } from "@/types/grammar";

const PUBLIC_COLUMNS = "id, category, question_text, choice_a, choice_b, choice_c, choice_d";

export async function getUnansweredGrammarQuestions(
  limit = 15
): Promise<GrammarQuestionPublic[]> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data: answered, error: answeredError } = await supabase
    .from("grammar_answers")
    .select("question_id")
    .eq("user_id", user.id);

  if (answeredError) throw answeredError;
  const answeredIds = (answered ?? []).map((row) => row.question_id);

  let query = supabase.from("grammar_questions").select(PUBLIC_COLUMNS).limit(limit);
  if (answeredIds.length > 0) {
    query = query.not("id", "in", `(${answeredIds.join(",")})`);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

// 苦手復習: 過去に誤答した問題のみを再出題する
export async function getIncorrectGrammarQuestions(
  limit = 15
): Promise<GrammarQuestionPublic[]> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data: incorrect, error: incorrectError } = await supabase
    .from("grammar_answers")
    .select("question_id")
    .eq("user_id", user.id)
    .eq("is_correct", false);

  if (incorrectError) throw incorrectError;
  const incorrectIds = (incorrect ?? []).map((row) => row.question_id);
  if (incorrectIds.length === 0) return [];

  const { data, error } = await supabase
    .from("grammar_questions")
    .select(PUBLIC_COLUMNS)
    .in("id", incorrectIds)
    .limit(limit);

  if (error) throw error;
  return data ?? [];
}

export async function checkGrammarAnswer(
  questionId: string,
  selected: Choice
): Promise<{ isCorrect: boolean; correctChoice: Choice; explanation: string }> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("grammar_questions")
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

export async function recordGrammarAnswer(
  userId: string,
  questionId: string,
  selected: Choice,
  isCorrect: boolean
) {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("grammar_answers").upsert(
    {
      user_id: userId,
      question_id: questionId,
      selected_choice: selected,
      is_correct: isCorrect,
      answered_at: new Date().toISOString(),
    },
    { onConflict: "user_id,question_id" }
  );

  if (error) throw error;
}
