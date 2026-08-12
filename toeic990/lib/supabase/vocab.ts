import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Card } from "@/lib/fsrs";
import type { VocabCardRow } from "@/types/vocab";

export function rowToCard(row: VocabCardRow): Card {
  return {
    due: new Date(row.due),
    stability: row.stability,
    difficulty: row.difficulty,
    elapsed_days: row.elapsed_days,
    scheduled_days: row.scheduled_days,
    reps: row.reps,
    lapses: row.lapses,
    state: row.state,
    last_review: row.last_review ? new Date(row.last_review) : undefined,
  };
}

// ts-fsrsのState: 2 = Review。安定度(記憶保持日数の目安)がこの日数を超えたReview状態のカードは
// 十分習熟したとみなし、以後の復習対象から除外する
const MASTERED_STATE = 2;
const MASTERED_STABILITY_DAYS = 30;

export async function getDueVocabCards(limit = 30, category?: string): Promise<VocabCardRow[]> {
  const supabase = await createSupabaseServerClient();
  let query = supabase
    .from("vocab_cards")
    .select("*")
    .lte("due", new Date().toISOString())
    .or(`state.neq.${MASTERED_STATE},stability.lt.${MASTERED_STABILITY_DAYS}`)
    .order("due", { ascending: true })
    .limit(limit);

  if (category) {
    query = query.eq("category", category);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data ?? [];
}

// 苦手復習: lapses(失敗回数)が多い順、次いでdifficultyが高い順に出題する。
// due日時は問わず、習熟済み(mastered)のカードのみ除外する
export async function getWeakVocabCards(limit = 20): Promise<VocabCardRow[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("vocab_cards")
    .select("*")
    .or(`state.neq.${MASTERED_STATE},stability.lt.${MASTERED_STABILITY_DAYS}`)
    .gt("lapses", 0)
    .order("lapses", { ascending: false })
    .order("difficulty", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data ?? [];
}

export async function getVocabCategories(): Promise<string[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("vocab_cards")
    .select("category")
    .not("category", "is", null);

  if (error) throw error;
  const unique = new Set((data ?? []).map((row) => row.category as string));
  return Array.from(unique).sort();
}

export async function getDueVocabCardCount(): Promise<number> {
  const supabase = await createSupabaseServerClient();
  const { count, error } = await supabase
    .from("vocab_cards")
    .select("id", { count: "exact", head: true })
    .lte("due", new Date().toISOString())
    .or(`state.neq.${MASTERED_STATE},stability.lt.${MASTERED_STABILITY_DAYS}`);

  if (error) throw error;
  return count ?? 0;
}

export async function getVocabCardById(id: string): Promise<VocabCardRow | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("vocab_cards")
    .select("*")
    .eq("id", id)
    .single();

  if (error) return null;
  return data;
}

export async function updateVocabCardAfterReview(id: string, card: Card) {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("vocab_cards")
    .update({
      due: card.due.toISOString(),
      stability: card.stability,
      difficulty: card.difficulty,
      elapsed_days: card.elapsed_days,
      scheduled_days: card.scheduled_days,
      reps: card.reps,
      lapses: card.lapses,
      state: card.state,
      last_review: card.last_review ? card.last_review.toISOString() : null,
    })
    .eq("id", id);

  if (error) throw error;
}
