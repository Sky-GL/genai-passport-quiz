"use server";

import { revalidatePath } from "next/cache";
import { checkGrammarAnswer, recordGrammarAnswer } from "@/lib/supabase/grammar";
import { recordStudyActivity } from "@/lib/supabase/gamification";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Choice, GrammarAnswerResult } from "@/types/grammar";

const XP_CORRECT = 10;
const XP_INCORRECT = 3;

export async function submitGrammarAnswer(
  questionId: string,
  selected: Choice
): Promise<GrammarAnswerResult> {
  const supabase = await createSupabaseServerClient();

  // 正解チェックとユーザー取得は互いに依存しないので並列実行
  const [{ isCorrect, correctChoice, explanation }, userResult] = await Promise.all([
    checkGrammarAnswer(questionId, selected),
    supabase.auth.getUser(),
  ]);

  const user = userResult.data.user;
  if (!user) throw new Error("未ログインです");

  const xp = isCorrect ? XP_CORRECT : XP_INCORRECT;

  // 解答記録とXP付与も互いに依存しないので並列実行
  await Promise.all([
    recordGrammarAnswer(user.id, questionId, selected, isCorrect),
    recordStudyActivity(xp),
  ]);

  // /vocabはセッション内で出題リストをクライアント側に保持しているため再取得しない
  // (回答済み除外の出題ロジックと組み合わさるとindexがずれてしまうため)
  revalidatePath("/dashboard");

  return { isCorrect, correctChoice, explanation, xp };
}
