// 1セッションの問題数
export const SESSION_SIZE = 10;

// クライアントへ渡す出題データ。correctMeaning/explanationは含めない（先読み防止）
export type QuizQuestion = {
  cardId: string;
  front: string;
  pronunciation: string | null;
  partOfSpeech: string | null;
  category: string | null;
  choices: string[];
};

// 回答後にサーバーから返る採点結果
export type QuizAnswerResult = {
  isCorrect: boolean;
  correctMeaning: string;
  explanation: string;
  xp: number;
};

export type ActiveSession = {
  sessionId: string;
  answeredCount: number;
  answeredCardIds: string[];
};
