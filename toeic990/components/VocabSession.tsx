"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Rating, type Grade } from "ts-fsrs";
import type { VocabCardRow } from "@/types/vocab";
import { getCurrentStreak, submitVocabReview } from "@/app/vocab/actions";
import VocabCard from "./VocabCard";

const GRADE_BUTTONS: { grade: Grade; label: string; className: string }[] = [
  { grade: Rating.Again, label: "もう一度", className: "bg-danger-soft text-danger-text" },
  { grade: Rating.Hard, label: "難しい", className: "bg-accent-soft text-accent-text" },
  { grade: Rating.Good, label: "普通", className: "bg-primary-soft text-primary-dark" },
  { grade: Rating.Easy, label: "簡単", className: "bg-success-soft text-success-text" },
];

type Props = {
  cards: VocabCardRow[];
};

type SessionStats = {
  reviewed: number;
  correct: number;
  xp: number;
  streak: number | null;
};

export default function VocabSession({ cards }: Props) {
  const total = cards.length;
  const [queue, setQueue] = useState(cards);
  const [flipped, setFlipped] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [stats, setStats] = useState<SessionStats>({ reviewed: 0, correct: 0, xp: 0, streak: null });

  const current = queue[0];

  const handleGrade = (grade: Grade) => {
    if (!current || isPending) return;
    startTransition(async () => {
      const { xp } = await submitVocabReview(current.id, grade);
      const nextQueue = queue.slice(1);
      const nextStats: SessionStats = {
        reviewed: stats.reviewed + 1,
        correct: stats.correct + (grade === Rating.Again ? 0 : 1),
        xp: stats.xp + xp,
        streak: stats.streak,
      };

      if (nextQueue.length === 0) {
        nextStats.streak = await getCurrentStreak();
      }

      setStats(nextStats);
      setQueue(nextQueue);
      setFlipped(false);
    });
  };

  if (!current) {
    const accuracy = stats.reviewed > 0 ? Math.round((stats.correct / stats.reviewed) * 100) : 0;

    return (
      <div className="flex min-h-[320px] w-full max-w-[340px] flex-col items-center justify-center gap-3.5 rounded-xl2 bg-gradient-to-br from-primary to-navy px-6 py-8 text-center text-white">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/15">
          <div className="h-6 w-6 rotate-45 rounded-md bg-accent" />
        </div>
        <p className="font-heading text-xl font-bold">本日の復習は完了です</p>
        <p className="text-[13px] opacity-80">
          {stats.reviewed}枚 学習 ・ 正答率 {accuracy}% ・ +{stats.xp} XP
        </p>
        {stats.streak !== null && stats.streak > 0 && (
          <div className="mt-1 flex items-center gap-1.5 rounded-full bg-white/12 px-3.5 py-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            <span className="font-heading text-[13px] font-bold">連続記録 {stats.streak}日目</span>
          </div>
        )}
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
      <div className="flex w-full max-w-[340px] items-center justify-between text-[12.5px] font-medium text-ink-muted">
        <span>残り {queue.length} / {total}枚</span>
        <span>{flipped ? "裏面" : "表面"}</span>
      </div>
      <div className="h-1.5 w-full max-w-[340px] overflow-hidden rounded-full bg-primary-soft">
        <div
          className="h-full rounded-full bg-primary transition-all"
          style={{ width: `${((total - queue.length) / total) * 100}%` }}
        />
      </div>

      <VocabCard
        front={current.front}
        back={current.back}
        category={current.category}
        relatedWords={current.related_words}
        collocation={current.collocation}
        flipped={flipped}
        onFlip={() => setFlipped((f) => !f)}
      />

      {flipped && (
        <div className="grid w-full max-w-[340px] grid-cols-4 gap-2">
          {GRADE_BUTTONS.map(({ grade, label, className }) => (
            <button
              key={grade}
              type="button"
              disabled={isPending}
              onClick={() => handleGrade(grade)}
              className={`h-[52px] rounded-[11px] text-xs font-bold disabled:opacity-50 ${className}`}
            >
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
