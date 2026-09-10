// 1セッションの問題数
export const SESSION_SIZE = 10;

// クライアントへ渡す出題データ。TOEIC Part5形式の空所補充。
// 正解の単語・意味・解説は含めない（先読み防止）
export type QuizQuestion = {
  cardId: string;
  // 対象語を「___」に置き換えた英文
  sentence: string;
  category: string | null;
  // 英単語4択（正解の原形＋他カードの原形3つ）
  choices: string[];
};

// 回答後にサーバーから返る採点結果
export type QuizAnswerResult = {
  isCorrect: boolean;
  correctWord: string;
  meaning: string;
  pronunciation: string | null;
  partOfSpeech: string | null;
  // 空所を埋めた完成文
  completedSentence: string;
  xp: number;
};

export type ActiveSession = {
  sessionId: string;
  answeredCount: number;
  answeredCardIds: string[];
};
