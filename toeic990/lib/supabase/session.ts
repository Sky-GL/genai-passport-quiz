import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getDueVocabCards } from "@/lib/supabase/vocab";
import { estimateToeicScore, type ScoreEstimate } from "@/lib/score-estimate";
import type { VocabCardRow } from "@/types/vocab";
import { SESSION_SIZE, type ActiveSession, type QuizQuestion } from "@/types/session";

// 直近のセッションを判定するために読む行数(1セッション最大SESSION_SIZE行)
const RECENT_ROW_LIMIT = SESSION_SIZE * 5;
const CHOICE_COUNT = 4;

// 予想スコアの算出に使う直近の回答数
const ESTIMATE_WINDOW = 100;

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

type DistractorWord = { front: string; partOfSpeech: string | null };

// 4択の誤答に使う、他カードの見出し語を集める
async function getDistractorWords(excludeIds: string[]): Promise<DistractorWord[]> {
  const supabase = await createSupabaseServerClient();
  let query = supabase.from("vocab_cards").select("id, front, part_of_speech").limit(200);
  if (excludeIds.length > 0) {
    query = query.not("id", "in", `(${excludeIds.join(",")})`);
  }

  const { data, error } = await query;
  if (error) throw error;

  return (data ?? []).map((row) => ({
    front: row.front as string,
    partOfSpeech: (row.part_of_speech as string | null) ?? null,
  }));
}

// 品詞が同じ語を優先して誤答を選ぶ。文法で消去できてしまう選択肢を減らすため
function pickDistractors(pool: DistractorWord[], card: VocabCardRow): string[] {
  const usable = pool.filter(
    (item) => item.front.toLowerCase() !== card.front.toLowerCase() && item.front.length > 0
  );
  const samePos = card.part_of_speech
    ? usable.filter((item) => item.partOfSpeech === card.part_of_speech)
    : [];

  const picked: string[] = [];
  for (const candidate of [...shuffle(samePos), ...shuffle(usable)]) {
    if (picked.length >= CHOICE_COUNT - 1) break;
    if (!picked.includes(candidate.front)) picked.push(candidate.front);
  }
  return picked;
}

// 出題カードから空所補充問題を組み立てる。正解と意味はクライアントへ渡さない
export async function buildQuizQuestions(cards: VocabCardRow[]): Promise<QuizQuestion[]> {
  const usableCards = cards.filter((card) => !!card.quiz_sentence);
  if (usableCards.length === 0) return [];

  const pool = await getDistractorWords(usableCards.map((card) => card.id));

  return usableCards.map((card) => ({
    cardId: card.id,
    sentence: card.quiz_sentence as string,
    category: card.category,
    choices: shuffle([card.front, ...pickDistractors(pool, card)]),
  }));
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

// 直近の語彙問題の成績からTOEIC予想スコアを出す。回答数が少ないうちはnull
export async function getScoreEstimate(userId: string): Promise<ScoreEstimate | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("session_progress")
    .select("card_id, is_correct")
    .eq("user_id", userId)
    .order("answered_at", { ascending: false })
    .limit(ESTIMATE_WINDOW);

  if (error) throw error;
  const rows = data ?? [];
  if (rows.length === 0) return null;

  const cardIds = Array.from(new Set(rows.map((row) => row.card_id as string)));
  const { data: cards, error: cardError } = await supabase
    .from("vocab_cards")
    .select("id, toeic_level")
    .in("id", cardIds);

  if (cardError) throw cardError;

  const levelById = new Map(
    (cards ?? []).map((card) => [card.id as string, (card.toeic_level as number | null) ?? null])
  );

  return estimateToeicScore(
    rows.map((row) => ({
      isCorrect: row.is_correct as boolean,
      level: levelById.get(row.card_id as string) ?? null,
    }))
  );
}
