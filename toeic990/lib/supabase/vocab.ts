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

export async function getDueVocabCards(limit = 30, category?: string): Promise<VocabCardRow[]> {
  const supabase = await createSupabaseServerClient();
  let query = supabase
    .from("vocab_cards")
    .select("*")
    .lte("due", new Date().toISOString())
    .order("due", { ascending: true })
    .limit(limit);

  if (category) {
    query = query.eq("category", category);
  }

  const { data, error } = await query;

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
    .lte("due", new Date().toISOString());

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
