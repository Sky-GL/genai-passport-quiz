"use server";

import { revalidatePath } from "next/cache";
import { gradeCard, type Grade } from "@/lib/fsrs";
import {
  getVocabCardById,
  rowToCard,
  updateVocabCardAfterReview,
} from "@/lib/supabase/vocab";

export async function submitVocabReview(cardId: string, grade: Grade) {
  const row = await getVocabCardById(cardId);
  if (!row) throw new Error("カードが見つかりません");

  const currentCard = rowToCard(row);
  const nextCard = gradeCard(currentCard, grade);
  await updateVocabCardAfterReview(cardId, nextCard);

  revalidatePath("/vocab");
}
