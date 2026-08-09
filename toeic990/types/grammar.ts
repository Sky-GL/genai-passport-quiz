export type Choice = "A" | "B" | "C" | "D";

// 出題時にクライアントへ渡す形。正解(correct_choice)と解説は含めない
export type GrammarQuestionPublic = {
  id: string;
  category: string;
  question_text: string;
  choice_a: string;
  choice_b: string;
  choice_c: string;
  choice_d: string;
};

export type GrammarAnswerResult = {
  isCorrect: boolean;
  correctChoice: Choice;
  explanation: string;
  xp: number;
};
