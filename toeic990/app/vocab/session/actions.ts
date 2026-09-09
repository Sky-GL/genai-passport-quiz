"use server";

import { revalidatePath } from "next/cache";
import { gradeCard, Rating } from "@/lib/fsrs";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getVocabCardById, rowToCard, updateVocabCardAfterReview } from "@/lib/supabase/vocab";
import { recordStudyActivity } from "@/lib/supabase/gamification";
import { recordSessionAnswer } from "@/lib/supabase/session";
import { buildExplanation, splitBack } from "@/lib/vocab-text";
import { XP_BY_GRADE } from "@/lib/gamification";
import type { QuizAnswerResult } from "@/types/session";

export async function submitQuizAnswer(
  sessionId: string,
  cardId: string,
  selectedMeaning: string
): Promise<QuizAnswerResult> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("未ログインです");

  const row = await getVocabCardById(cardId);
  if (!row) throw new Error("カードが見つかりません");

  // 正誤判定はサーバー側で行う(クライアントには正解を渡していない)
  const correctMeaning = splitBack(row.back).meaning;
  const isCorrect = selectedMeaning === correctMeaning;

  // 4択の結果をFSRSの評価に変換する
  const grade = isCorrect ? Rating.Good : Rating.Again;
  const nextCard = gradeCard(rowToCard(row), grade);
  const xp = XP_BY_GRADE[grade];

  // 1問ごとに即記録する(バッチ保存にしない)
  await Promise.all([
    updateVocabCardAfterReview(cardId, nextCard),
    recordSessionAnswer(user.id, sessionId, cardId, isCorrect),
    recordStudyActivity(xp),
  ]);

  revalidatePath("/");
  revalidatePath("/dashboard");

  return {
    isCorrect,
    correctMeaning,
    explanation: isCorrect ? "" : buildExplanation(row),
    xp,
  };
}
