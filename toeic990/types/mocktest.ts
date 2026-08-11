export type Part = "part5" | "part6";
export type Choice = "A" | "B" | "C" | "D";

export type MockTestQuestionPublic = {
  id: string;
  part: Part;
  passage_id: string | null;
  blank_number: number | null;
  question_text: string;
  choice_a: string;
  choice_b: string;
  choice_c: string;
  choice_d: string;
  order_index: number;
};

export type MockTestPassage = {
  id: string;
  title: string;
  passage_text: string;
};

export type MockTestSet = {
  questions: MockTestQuestionPublic[];
  passages: MockTestPassage[];
};

export type Mode = "timed" | "practice";

export type MockTestQuestionResult = {
  questionId: string;
  selected: Choice | null;
  correctChoice: Choice;
  isCorrect: boolean;
  explanation: string;
};

export type MockTestResult = {
  overallScoreEstimate: number;
  totalCount: number;
  correctCount: number;
  partAccuracy: { part: Part; correct: number; total: number }[];
  questionResults: MockTestQuestionResult[];
  xp: number;
};
