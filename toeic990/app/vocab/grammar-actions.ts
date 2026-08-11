"use server";

import { revalidatePath } from "next/cache";
import { checkGrammarAnswer, recordGrammarAnswer } from "@/lib/supabase/grammar";
import { recordStudyActivity } from "@/lib/supabase/gamification";
import type { Choice, GrammarAnswerResult } from "@/types/grammar";

const XP_CORRECT = 10;
const XP_INCORRECT = 3;

export async function submitGrammarAnswer(
  questionId: string,
  selected: Choice
): Promise<GrammarAnswerResult> {
  const { isCorrect, correctChoice, explanation } = await checkGrammarAnswer(questionId, selected);
  await recordGrammarAnswer(questionId, selected, isCorrect);

  const xp = isCorrect ? XP_CORRECT : XP_INCORRECT;
  await recordStudyActivity(xp);

  // /vocabはセッション内で出題リストをクライアント側に保持しているため再取得しない
  // (回答済み除外の出題ロジックと組み合わさるとindexがずれてしまうため)
  revalidatePath("/dashboard");

  return { isCorrect, correctChoice, explanation, xp };
}
