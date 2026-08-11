"use server";

import { revalidatePath } from "next/cache";
import { getCorrectAnswers } from "@/lib/supabase/mocktest";
import { recordStudyActivity } from "@/lib/supabase/gamification";
import type { Choice, MockTestResult, Part } from "@/types/mocktest";

const XP_PER_CORRECT = 8;
const MAX_SCORE = 990;
const MIN_SCORE = 5;

export type SubmittedAnswer = { questionId: string; selected: Choice | null };

export async function submitMockTest(answers: SubmittedAnswer[]): Promise<MockTestResult> {
  const answerMap = new Map(answers.map((a) => [a.questionId, a.selected]));
  const correctAnswers = await getCorrectAnswers(Array.from(answerMap.keys()));

  const partTotals = new Map<Part, { correct: number; total: number }>();
  const questionResults: MockTestResult["questionResults"] = [];
  let correctCount = 0;

  for (const [questionId, selected] of answerMap) {
    const answerInfo = correctAnswers.get(questionId);
    if (!answerInfo) continue;

    const isCorrect = selected === answerInfo.correctChoice;
    if (isCorrect) correctCount += 1;

    const part = answerInfo.part as Part;
    const current = partTotals.get(part) ?? { correct: 0, total: 0 };
    partTotals.set(part, {
      correct: current.correct + (isCorrect ? 1 : 0),
      total: current.total + 1,
    });

    questionResults.push({
      questionId,
      selected,
      correctChoice: answerInfo.correctChoice,
      isCorrect,
      explanation: answerInfo.explanation,
    });
  }

  const totalCount = answerMap.size;
  const accuracy = totalCount > 0 ? correctCount / totalCount : 0;
  const overallScoreEstimate = Math.round(
    Math.min(MAX_SCORE, Math.max(MIN_SCORE, accuracy * MAX_SCORE))
  );

  const xp = correctCount * XP_PER_CORRECT;
  if (xp > 0) {
    await recordStudyActivity(xp);
  }

  revalidatePath("/dashboard");

  return {
    overallScoreEstimate,
    totalCount,
    correctCount,
    partAccuracy: Array.from(partTotals.entries()).map(([part, v]) => ({ part, ...v })),
    questionResults,
    xp,
  };
}
