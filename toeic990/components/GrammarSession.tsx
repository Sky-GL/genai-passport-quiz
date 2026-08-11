"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import type { Choice, GrammarAnswerResult, GrammarQuestionPublic } from "@/types/grammar";
import { submitGrammarAnswer } from "@/app/vocab/grammar-actions";
import GrammarQuestion from "./GrammarQuestion";

type Props = {
  questions: GrammarQuestionPublic[];
};

export default function GrammarSession({ questions }: Props) {
  // セッション開始時点の出題リストをローカルに固定する
  // (親のquestions propが再取得で変化しても、進行中のindexとズレないようにするため)
  const [sessionQuestions] = useState(questions);
  const total = sessionQuestions.length;
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<Choice | null>(null);
  const [result, setResult] = useState<GrammarAnswerResult | null>(null);
  const [isPending, startTransition] = useTransition();
  const [stats, setStats] = useState({ answered: 0, correct: 0, xp: 0 });

  const current = sessionQuestions[index];

  const handleSelect = (choice: Choice) => {
    if (result || isPending) return;
    setSelected(choice);
    startTransition(async () => {
      const res = await submitGrammarAnswer(current.id, choice);
      setResult(res);
      setStats((s) => ({
        answered: s.answered + 1,
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
    const accuracy = stats.answered > 0 ? Math.round((stats.correct / stats.answered) * 100) : 0;

    return (
      <div className="flex min-h-[280px] w-full max-w-[420px] flex-col items-center justify-center gap-3.5 rounded-xl2 bg-gradient-to-br from-primary to-navy px-6 py-8 text-center text-white">
        <p className="font-heading text-xl font-bold">文法問題は完了です</p>
        <p className="text-[13px] opacity-80">
          {stats.answered}問 回答 ・ 正答率 {accuracy}% ・ +{stats.xp} XP
        </p>
        <Link
          href="/dashboard"
          className="mt-2 h-[42px] rounded-[10px] bg-white px-5 text-[13px] font-bold leading-[42px] text-primary-dark no-underline"
        >
          ダッシュボードに戻る
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-3.5">
      <GrammarQuestion
        question={current}
        index={index + 1}
        total={total}
        selected={selected}
        result={result}
        onSelect={handleSelect}
      />

      {result && (
        <button
          type="button"
          onClick={handleNext}
          className="h-[42px] w-full max-w-[420px] self-end rounded-[10px] bg-primary px-5 text-[13px] font-bold text-white"
        >
          次の問題へ
        </button>
      )}
    </div>
  );
}
