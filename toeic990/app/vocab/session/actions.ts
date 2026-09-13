"use server";

import { gradeCard, Rating } from "@/lib/fsrs";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getVocabCardById, rowToCard, updateVocabCardAfterReview } from "@/lib/supabase/vocab";
import { recordStudyActivity } from "@/lib/supabase/gamification";
import { recordSessionAnswer } from "@/lib/supabase/session";
import { splitBack } from "@/lib/vocab-text";
import { XP_BY_GRADE } from "@/lib/gamification";
import type { QuizAnswerResult } from "@/types/session";

export async function submitQuizAnswer(
  sessionId: string,
  cardId: string,
  selectedWord: string
): Promise<QuizAnswerResult> {
  const supabase = await createSupabaseServerClient();

  // 認証確認とカード取得は互いに依存しないので同時に投げる(直列だと往復が1回増える)
  const [
    {
      data: { user },
    },
    row,
  ] = await Promise.all([supabase.auth.getUser(), getVocabCardById(cardId)]);

  if (!user) throw new Error("未ログインです");
  if (!row) throw new Error("カードが見つかりません");

  // 正誤判定はサーバー側で行う(クライアントには正解を渡していない)
  const isCorrect = selectedWord.toLowerCase() === row.front.toLowerCase();

  // 4択の結果をFSRSの評価に変換する
  const grade = isCorrect ? Rating.Good : Rating.Again;
  const nextCard = gradeCard(rowToCard(row), grade);
  const gradeXp = XP_BY_GRADE[grade];

  // 1問ごとに即記録する(バッチ保存にしない)。
  // 記録を先に行い、同じ問題の再送信ならFSRSとXPを二重に加算しない
  const { alreadyAnswered } = await recordSessionAnswer(user.id, sessionId, cardId, isCorrect);
  if (!alreadyAnswered) {
    await Promise.all([
      updateVocabCardAfterReview(cardId, nextCard),
      recordStudyActivity(gradeXp),
    ]);
  }

  // ここでrevalidatePathを呼ぶと、1問ごとに/vocab/sessionの再描画
  // (出題カードと誤答用の語の再取得)まで誘発して数百ms×往復ぶん遅くなる。
  // / も /dashboard も動的レンダリング(キャッシュなし)なので、
  // セッション終了時にクライアントからrouter.refresh()すれば十分。

  return {
    isCorrect,
    correctWord: row.front,
    meaning: splitBack(row.back).meaning,
    pronunciation: row.pronunciation,
    partOfSpeech: row.part_of_speech,
    // 空所が複数ある文でも全て埋める
    completedSentence: (row.quiz_sentence ?? "").split("___").join(row.front),
    xp: alreadyAnswered ? 0 : gradeXp,
  };
}
