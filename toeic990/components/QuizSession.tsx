"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { submitQuizAnswer } from "@/app/vocab/session/actions";
import AnswerFeedback from "./AnswerFeedback";
import type { QuizAnswerResult, QuizQuestion } from "@/types/session";

type Props = {
  sessionId: string;
  questions: QuizQuestion[];
  answeredCount: number;
  total: number;
};

const CHOICE_LABELS = ["(A)", "(B)", "(C)", "(D)"];

// 「___」の前後で英文を分け、空所だけ強調して表示する
function BlankSentence({ sentence }: { sentence: string }) {
  const parts = sentence.split("___");
  return (
    <p className="w-full break-words text-left text-[26px] leading-[1.7] text-ink">
      {parts.map((part, i) => (
        <span key={i}>
          {part}
          {i < parts.length - 1 && (
            <span className="mx-1 inline-block min-w-[86px] border-b-[3px] border-primary align-baseline" />
          )}
        </span>
      ))}
    </p>
  );
}

export default function QuizSession({ sessionId, questions, answeredCount, total }: Props) {
  // セッション開始時点の出題リストを固定する(再取得でindexがずれないように)
  const [sessionQuestions] = useState(questions);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [result, setResult] = useState<QuizAnswerResult | null>(null);
  const [isPending, startTransition] = useTransition();
  const [stats, setStats] = useState({ correct: 0, xp: 0 });

  const current = sessionQuestions[index];
  const doneCount = answeredCount + index;

  const handleSelect = (choice: string) => {
    if (result || isPending) return;
    setSelected(choice);
    startTransition(async () => {
      const res = await submitQuizAnswer(sessionId, current.cardId, choice);
      setResult(res);
      setStats((s) => ({
        correct: s.correct + (res.isCorrect ? 1 : 0),
        xp: s.xp + res.xp,
      }));
    });
  };

  const handleNext = () => {
    setSelected(null);
    setResult(null);
    setIndex((i) => i + 1);
  };

  if (!current) {
    const answeredInThisRun = index;
    const accuracy =
      answeredInThisRun > 0 ? Math.round((stats.correct / answeredInThisRun) * 100) : 0;
    const perfect = answeredInThisRun > 0 && stats.correct === answeredInThisRun;

    return (
      <div className="relative flex min-h-[360px] w-full max-w-[460px] flex-col items-center justify-center gap-4 overflow-hidden rounded-xl3 bg-gradient-to-br from-primary via-primary to-navy px-6 py-8 text-center text-white shadow-hero">
        <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-accent/25 blur-3xl" />
        <p className="relative font-heading text-[30px] font-bold">
          {perfect ? "満点！" : "セッション完了"}
        </p>
        <p className="relative text-[20px] opacity-80">
          {answeredInThisRun}問 回答 ・ 正答率 {accuracy}% ・ +{stats.xp} XP
        </p>
        <Link
          href="/"
          className="relative mt-2 h-[50px] rounded-[10px] bg-white px-6 text-[20px] font-bold leading-[50px] text-primary-dark no-underline transition-all duration-300 ease-spring hover:scale-[0.98]"
        >
          トップに戻る
        </Link>
      </div>
    );
  }

  return (
    <div className="flex w-full max-w-[460px] flex-col gap-4">
      <div className="flex items-center justify-between text-[20px] font-medium text-ink-muted">
        <span>
          {doneCount + 1} / {total}問
        </span>
        {current.category && <span className="text-[18px]">{current.category}</span>}
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-primary-soft">
        <div
          className="h-full rounded-full bg-primary transition-all duration-500 ease-spring"
          style={{ width: `${(doneCount / total) * 100}%` }}
        />
      </div>

      <div className="flex flex-col gap-5 rounded-xl2 bg-surface p-6 shadow-card sm:p-7">
        <BlankSentence sentence={current.sentence} />

        <div className="flex flex-col gap-3">
          {current.choices.map((choice, i) => {
            const isSelected = selected === choice;
            const isCorrectChoice = result?.correctWord === choice;
            let stateClass =
              "border-border/50 text-ink hover:border-primary/40 hover:bg-primary-soft/40";
            if (result) {
              if (isCorrectChoice) {
                stateClass = "border-success bg-success-soft text-success-text";
              } else if (isSelected) {
                stateClass = "border-danger bg-danger-soft text-danger-text";
              } else {
                stateClass = "border-border/30 text-ink-muted";
              }
            }

            return (
              <button
                key={choice}
                type="button"
                disabled={!!result || isPending}
                onClick={() => handleSelect(choice)}
                className={`flex items-baseline gap-3 rounded-[11px] border px-4 py-4 text-left transition-all duration-300 ease-spring disabled:cursor-default ${stateClass}`}
              >
                <span className="shrink-0 text-[20px] font-bold opacity-60">
                  {CHOICE_LABELS[i]}
                </span>
                <span className="min-w-0 break-words text-[24px]">{choice}</span>
              </button>
            );
          })}
        </div>

        {result && <AnswerFeedback result={result} />}
      </div>

      {result && (
        <button
          type="button"
          onClick={handleNext}
          className="h-[56px] rounded-[10px] bg-primary text-[22px] font-bold text-white transition-all duration-300 ease-spring hover:scale-[0.98] hover:bg-primary-dark"
        >
          {index === sessionQuestions.length - 1 ? "結果を見る" : "次の問題へ"}
        </button>
      )}
    </div>
  );
}
