"use server";

import { revalidatePath } from "next/cache";
import { gradeCard, type Grade } from "@/lib/fsrs";
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
  await updateVocabCardAfterReview(cardId, nextCard);

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
