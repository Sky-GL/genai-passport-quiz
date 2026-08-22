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
      <div className="relative flex min-h-[320px] w-full max-w-[460px] flex-col items-center justify-center gap-4 overflow-hidden rounded-xl3 bg-gradient-to-br from-primary via-primary to-navy px-6 py-8 text-center text-white shadow-hero">
        <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-accent/25 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-14 -left-10 h-36 w-36 rounded-full bg-white/10 blur-3xl" />
        <p className="relative font-heading text-[30px] font-bold">文法問題は完了です</p>
        <p className="relative text-[20px] opacity-80">
          {stats.answered}問 回答 ・ 正答率 {accuracy}% ・ +{stats.xp} XP
        </p>
        <Link
          href="/dashboard"
          className="relative mt-2 h-[50px] rounded-[10px] bg-white px-6 text-[20px] font-bold leading-[50px] text-primary-dark no-underline transition-all duration-300 ease-spring hover:scale-[0.98]"
        >
          ダッシュボードに戻る
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4">
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
          className="h-[50px] w-full max-w-[460px] self-end rounded-[10px] bg-primary px-5 text-[20px] font-bold text-white transition-all duration-300 ease-spring hover:scale-[0.98] hover:bg-primary-dark"
        >
          次の問題へ
        </button>
      )}
    </div>
  );
}
