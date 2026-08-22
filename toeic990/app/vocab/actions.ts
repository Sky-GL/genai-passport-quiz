"use server";

import { revalidatePath } from "next/cache";
import { gradeCard, Rating, type Grade } from "@/lib/fsrs";
import {
  getVocabCardById,
  rowToCard,
  updateVocabCardAfterReview,
} from "@/lib/supabase/vocab";
import { getUserStats, recordStudyActivity } from "@/lib/supabase/gamification";
import { XP_BY_GRADE } from "@/lib/gamification";

export async function submitVocabReview(cardId: string, grade: Grade) {
  const row = await getVocabCardById(cardId);
  if (!row) throw new Error("カードが見つかりません");

  const currentCard = rowToCard(row);
  const nextCard = gradeCard(currentCard, grade);
  // 「簡単」と判定した単語は十分習得済みとみなし、以後の出題対象から除外する
  await updateVocabCardAfterReview(cardId, nextCard, grade === Rating.Easy);

  const xp = XP_BY_GRADE[grade];
  await recordStudyActivity(xp);

  revalidatePath("/vocab");
  revalidatePath("/dashboard");

  return { xp };
}

export async function getCurrentStreak(): Promise<number> {
  const stats = await getUserStats();
  return stats.current_streak;
}
