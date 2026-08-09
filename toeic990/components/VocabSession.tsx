"use client";

import { useState, useTransition } from "react";
import { Rating, type Grade } from "ts-fsrs";
import type { VocabCardRow } from "@/types/vocab";
import { submitVocabReview } from "@/app/vocab/actions";
import VocabCard from "./VocabCard";

const GRADE_BUTTONS: { grade: Grade; label: string; className: string }[] = [
  { grade: Rating.Again, label: "もう一度", className: "bg-red-600 hover:bg-red-500" },
  { grade: Rating.Hard, label: "難しい", className: "bg-orange-500 hover:bg-orange-400" },
  { grade: Rating.Good, label: "普通", className: "bg-emerald-600 hover:bg-emerald-500" },
  { grade: Rating.Easy, label: "簡単", className: "bg-sky-600 hover:bg-sky-500" },
];

type Props = {
  cards: VocabCardRow[];
};

export default function VocabSession({ cards }: Props) {
  const [queue, setQueue] = useState(cards);
  const [flipped, setFlipped] = useState(false);
  const [isPending, startTransition] = useTransition();
  const total = cards.length;

  const current = queue[0];

  const handleGrade = (grade: Grade) => {
    if (!current || isPending) return;
    startTransition(async () => {
      await submitVocabReview(current.id, grade);
      setQueue((prev) => prev.slice(1));
      setFlipped(false);
    });
  };

  if (!current) {
    return (
      <div className="flex flex-col items-center gap-2 py-16 text-center">
        <p className="text-xl font-semibold">本日の復習は完了です</p>
        <p className="text-sm text-slate-500">お疲れさまでした。また明日確認しましょう。</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-6">
      <p className="text-sm text-slate-500">
        残り {queue.length} / {total} 枚
      </p>

      <VocabCard
        front={current.front}
        back={current.back}
        flipped={flipped}
        onFlip={() => setFlipped((f) => !f)}
      />

      {flipped && (
        <div className="grid w-full max-w-md grid-cols-4 gap-2">
          {GRADE_BUTTONS.map(({ grade, label, className }) => (
            <button
              key={grade}
              type="button"
              disabled={isPending}
              onClick={() => handleGrade(grade)}
              className={`rounded-md px-2 py-3 text-sm font-medium text-white disabled:opacity-50 ${className}`}
            >
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
