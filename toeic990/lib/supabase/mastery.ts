import { createSupabaseServerClient } from "@/lib/supabase/server";
import { splitBack } from "@/lib/vocab-text";
import { bucketOf, emptyCounts, type MasteryBucket } from "@/lib/mastery";

// 苦手一覧を作るために読む回答履歴の件数
const WEAK_WINDOW = 400;
const WEAK_LIST_LIMIT = 20;

export type LevelProgress = {
  level: number;
  total: number;
  counts: Record<MasteryBucket, number>;
};

export type WeakWord = {
  cardId: string;
  front: string;
  meaning: string;
  level: number | null;
  wrong: number;
  total: number;
};

export type MasteryOverview = {
  total: number;
  counts: Record<MasteryBucket, number>;
  byLevel: LevelProgress[];
};

export async function getMasteryOverview(): Promise<MasteryOverview> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("vocab_cards")
    .select("state, stability, reps, excluded, toeic_level");

  if (error) throw error;
  const rows = data ?? [];

  const counts = emptyCounts();
  const levelMap = new Map<number, LevelProgress>();

  for (const row of rows) {
    const bucket = bucketOf({
      state: row.state as number,
      stability: row.stability as number,
      reps: row.reps as number,
      excluded: (row.excluded as boolean) ?? false,
    });
    counts[bucket] += 1;

    const level = (row.toeic_level as number | null) ?? 0;
    const entry = levelMap.get(level) ?? { level, total: 0, counts: emptyCounts() };
    entry.total += 1;
    entry.counts[bucket] += 1;
    levelMap.set(level, entry);
  }

  return {
    total: rows.length,
    counts,
    byLevel: Array.from(levelMap.values()).sort((a, b) => a.level - b.level),
  };
}

// 回答履歴から、間違えた回数が多い語を並べる。
// lapsesはLearning状態では増えないことがあるため、実際の回答履歴を根拠にする
export async function getWeakWords(userId: string): Promise<WeakWord[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("session_progress")
    .select("card_id, is_correct, vocab_cards(front, back, toeic_level)")
    .eq("user_id", userId)
    .order("answered_at", { ascending: false })
    .limit(WEAK_WINDOW);

  if (error) throw error;

  const tally = new Map<string, WeakWord>();
  for (const row of data ?? []) {
    const card = pickCard(row.vocab_cards);
    if (!card) continue;

    const cardId = row.card_id as string;
    const entry = tally.get(cardId) ?? {
      cardId,
      front: card.front,
      meaning: splitBack(card.back).meaning,
      level: card.toeic_level,
      wrong: 0,
      total: 0,
    };
    entry.total += 1;
    if (!(row.is_correct as boolean)) entry.wrong += 1;
    tally.set(cardId, entry);
  }

  return Array.from(tally.values())
    .filter((word) => word.wrong > 0)
    .sort((a, b) => b.wrong - a.wrong || b.total - a.total)
    .slice(0, WEAK_LIST_LIMIT);
}

// PostgRESTの埋め込みは多対一なら単一オブジェクト、型定義上は配列になる
function pickCard(
  embedded: unknown
): { front: string; back: string; toeic_level: number | null } | null {
  const card = Array.isArray(embedded) ? embedded[0] : embedded;
  if (!card || typeof card !== "object") return null;
  const { front, back, toeic_level: level } = card as Record<string, unknown>;
  if (typeof front !== "string" || typeof back !== "string") return null;
  return { front, back, toeic_level: typeof level === "number" ? level : null };
}
