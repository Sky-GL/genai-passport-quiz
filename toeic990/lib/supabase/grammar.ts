import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Choice, GrammarQuestionPublic } from "@/types/grammar";

const PUBLIC_COLUMNS = "id, category, question_text, choice_a, choice_b, choice_c, choice_d";

// 過去に誤答したことがある問題(今は正解済み)を苦手復習に混ぜる割合
const RECOVERED_SAMPLE_RATIO = 1 / 3;

// Fisher-Yatesシャッフル
function shuffle<T>(items: T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

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

// 苦手復習: 現在誤答中の問題は必ず、過去に誤答して今は正解済みの問題は
// たまに(RECOVERED_SAMPLE_RATIO)混ぜて再出題する
export async function getIncorrectGrammarQuestions(
  limit = 15
): Promise<GrammarQuestionPublic[]> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const [{ data: currentlyWrong, error: wrongError }, { data: recovered, error: recoveredError }] =
    await Promise.all([
      supabase
        .from("grammar_answers")
        .select("question_id")
        .eq("user_id", user.id)
        .eq("is_correct", false),
      supabase
        .from("grammar_answers")
        .select("question_id")
        .eq("user_id", user.id)
        .eq("is_correct", true)
        .eq("ever_incorrect", true),
    ]);

  if (wrongError) throw wrongError;
  if (recoveredError) throw recoveredError;

  const wrongIds = (currentlyWrong ?? []).map((row) => row.question_id);
  const recoveredIds = (recovered ?? []).map((row) => row.question_id);
  const sampledRecoveredIds = shuffle(recoveredIds).slice(
    0,
    Math.ceil(recoveredIds.length * RECOVERED_SAMPLE_RATIO)
  );

  const ids = [...wrongIds, ...sampledRecoveredIds];
  if (ids.length === 0) return [];

  const { data, error } = await supabase
    .from("grammar_questions")
    .select(PUBLIC_COLUMNS)
    .in("id", ids)
    .limit(limit);

  if (error) throw error;
  return shuffle(data ?? []);
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
  // ever_incorrectは誤答した時だけtrueを送る。正解時は送らないことで、
  // 既存行のever_incorrect(過去に誤答した記録)を上書き消去しないようにする
  const { error } = await supabase.from("grammar_answers").upsert(
    {
      user_id: userId,
      question_id: questionId,
      selected_choice: selected,
      is_correct: isCorrect,
      answered_at: new Date().toISOString(),
      ...(isCorrect ? {} : { ever_incorrect: true }),
    },
    { onConflict: "user_id,question_id" }
  );

  if (error) throw error;
}
