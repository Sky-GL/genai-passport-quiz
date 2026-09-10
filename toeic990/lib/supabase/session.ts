import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getDueVocabCards } from "@/lib/supabase/vocab";
import { splitBack } from "@/lib/vocab-text";
import type { VocabCardRow } from "@/types/vocab";
import { SESSION_SIZE, type ActiveSession, type QuizQuestion } from "@/types/session";

// 直近のセッションを判定するために読む行数(1セッション最大SESSION_SIZE行)
const RECENT_ROW_LIMIT = SESSION_SIZE * 5;
const CHOICE_COUNT = 4;

function shuffle<T>(items: T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// 未完了(回答数がSESSION_SIZE未満)の最新セッションを返す。なければnull
export async function getActiveSession(userId: string): Promise<ActiveSession | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("session_progress")
    .select("session_id, card_id, answered_at")
    .eq("user_id", userId)
    .order("answered_at", { ascending: false })
    .limit(RECENT_ROW_LIMIT);

  if (error) throw error;

  const rows = data ?? [];
  if (rows.length === 0) return null;

  const latestSessionId = rows[0].session_id as string;
  const sessionRows = rows.filter((row) => row.session_id === latestSessionId);
  if (sessionRows.length >= SESSION_SIZE) return null;

  return {
    sessionId: latestSessionId,
    answeredCount: sessionRows.length,
    answeredCardIds: sessionRows.map((row) => row.card_id as string),
  };
}

// 4択の誤答選択肢に使う、他カードの意味を集める
async function getDistractorMeanings(excludeIds: string[]): Promise<string[]> {
  const supabase = await createSupabaseServerClient();
  let query = supabase.from("vocab_cards").select("id, back").limit(120);
  if (excludeIds.length > 0) {
    query = query.not("id", "in", `(${excludeIds.join(",")})`);
  }

  const { data, error } = await query;
  if (error) throw error;

  return (data ?? []).map((row) => splitBack(row.back as string).meaning).filter(Boolean);
}

// 出題カードから4択問題を組み立てる。正解と解説はクライアントへ渡さない
export async function buildQuizQuestions(cards: VocabCardRow[]): Promise<QuizQuestion[]> {
  if (cards.length === 0) return [];

  const pool = await getDistractorMeanings(cards.map((card) => card.id));

  return cards.map((card) => {
    const correct = splitBack(card.back).meaning;
    const distractors = shuffle(pool.filter((meaning) => meaning !== correct)).slice(
      0,
      CHOICE_COUNT - 1
    );

    return {
      cardId: card.id,
      front: card.front,
      pronunciation: card.pronunciation,
      partOfSpeech: card.part_of_speech,
      category: card.category,
      choices: shuffle([correct, ...distractors]),
    };
  });
}

// セッションを開始(または再開)し、残りの出題を返す
export async function startOrResumeSession(userId: string): Promise<{
  sessionId: string;
  answeredCount: number;
  questions: QuizQuestion[];
}> {
  const active = await getActiveSession(userId);
  const sessionId = active?.sessionId ?? crypto.randomUUID();
  const answeredCount = active?.answeredCount ?? 0;
  const answeredCardIds = active?.answeredCardIds ?? [];
  const remaining = SESSION_SIZE - answeredCount;

  // 回答済みカードを除くため、必要数より多めに取得してから絞り込む
  const due = await getDueVocabCards(remaining + answeredCardIds.length);
  const cards = due.filter((card) => !answeredCardIds.includes(card.id)).slice(0, remaining);

  return {
    sessionId,
    answeredCount,
    questions: await buildQuizQuestions(cards),
  };
}

export async function recordSessionAnswer(
  userId: string,
  sessionId: string,
  cardId: string,
  isCorrect: boolean
) {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("session_progress").insert({
    user_id: userId,
    session_id: sessionId,
    card_id: cardId,
    is_correct: isCorrect,
  });

  if (error) throw error;
}
