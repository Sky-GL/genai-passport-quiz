"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import type { Choice, MockTestResult, MockTestSet, Mode } from "@/types/mocktest";
import { submitMockTest } from "@/app/mock-test/actions";
import MockTestQuestionCard from "./MockTestQuestionCard";

type Phase = "select" | "session" | "results";

const SECONDS_PER_QUESTION = 60;

function formatTime(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function MockTestApp({ questions, passages }: MockTestSet) {
  const [phase, setPhase] = useState<Phase>("select");
  const [mode, setMode] = useState<Mode>("practice");
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, Choice>>({});
  const [result, setResult] = useState<MockTestResult | null>(null);
  const [isPending, startTransition] = useTransition();
  const [remainingSeconds, setRemainingSeconds] = useState(0);

  const passageMap = useMemo(() => new Map(passages.map((p) => [p.id, p])), [passages]);
  const part5Count = questions.filter((q) => q.part === "part5").length;
  const part6Count = questions.filter((q) => q.part === "part6").length;

  const handleSubmit = () => {
    if (isPending) return;
    startTransition(async () => {
      const payload = questions.map((q) => ({ questionId: q.id, selected: answers[q.id] ?? null }));
      const res = await submitMockTest(payload);
      setResult(res);
      setPhase("results");
    });
  };

  useEffect(() => {
    if (phase !== "session" || mode !== "timed") return;
    if (remainingSeconds <= 0) {
      handleSubmit();
      return;
    }
    const timer = setTimeout(() => setRemainingSeconds((s) => s - 1), 1000);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, mode, remainingSeconds]);

  const startSession = () => {
    setRemainingSeconds(questions.length * SECONDS_PER_QUESTION);
    setIndex(0);
    setAnswers({});
    setPhase("session");
  };

  if (phase === "select") {
    return (
      <div className="flex w-full max-w-[420px] flex-col gap-5 rounded-xl2 border border-border bg-surface p-[26px] shadow-card">
        <div className="flex flex-col gap-3">
          {(["practice", "timed"] as Mode[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={`flex items-center gap-3 rounded-[11px] border-[1.5px] px-4 py-3 text-left ${
                mode === m ? "border-primary bg-primary-soft" : "border-border"
              }`}
            >
              <span
                className={`h-4 w-4 shrink-0 rounded-full border-2 ${
                  mode === m ? "border-primary bg-primary" : "border-border"
                }`}
              />
              <span className="flex flex-col">
                <span className="text-sm font-bold text-ink">
                  {m === "timed" ? "制限時間モード" : "演習モード"}
                </span>
                <span className="text-xs text-ink-muted">
                  {m === "timed" ? "1問60秒の目安で時間内に解答" : "時間無制限でじっくり解答"}
                </span>
              </span>
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-1 text-[13px] text-ink-muted">
          <div>Part5(短文穴埋め): {part5Count}問</div>
          <div>Part6(長文穴埋め): {part6Count}問</div>
        </div>

        <button
          type="button"
          onClick={startSession}
          className="h-[46px] rounded-[10px] bg-primary text-sm font-bold text-white"
        >
          演習を開始する
        </button>
      </div>
    );
  }

  if (phase === "session") {
    const current = questions[index];
    const passage = current.passage_id ? passageMap.get(current.passage_id) ?? null : null;
    const isLast = index === questions.length - 1;

    return (
      <div className="flex w-full flex-col items-center gap-4">
        <div className="flex w-full max-w-[560px] items-center justify-between rounded-xl2 bg-navy px-5 py-3 text-white">
          <span className="font-heading text-sm font-bold">
            {current.part === "part5" ? "Part 5" : "Part 6"} ・ Q{index + 1}/{questions.length}
          </span>
          {mode === "timed" && (
            <span className="font-heading text-sm font-bold text-accent">
              {formatTime(remainingSeconds)}
            </span>
          )}
        </div>

        <MockTestQuestionCard
          question={current}
          passage={passage}
          selected={answers[current.id] ?? null}
          onSelect={(choice) => setAnswers((a) => ({ ...a, [current.id]: choice }))}
        />

        <div className="flex w-full max-w-[560px] justify-between">
          <button
            type="button"
            disabled={index === 0}
            onClick={() => setIndex((i) => i - 1)}
            className="h-[42px] rounded-[10px] border border-border px-5 text-[13px] font-bold text-ink disabled:opacity-40"
          >
            前へ
          </button>
          {isLast ? (
            <button
              type="button"
              disabled={isPending}
              onClick={handleSubmit}
              className="h-[42px] rounded-[10px] bg-primary px-5 text-[13px] font-bold text-white disabled:opacity-50"
            >
              {isPending ? "採点中..." : "採点する"}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setIndex((i) => i + 1)}
              className="h-[42px] rounded-[10px] bg-primary px-5 text-[13px] font-bold text-white"
            >
              次へ
            </button>
          )}
        </div>
      </div>
    );
  }

  if (phase === "results" && result) {
    return (
      <div className="flex w-full max-w-[420px] flex-col gap-5 rounded-xl2 border border-border bg-surface p-[26px] shadow-card">
        <div className="flex flex-col items-center gap-1 text-center">
          <span className="text-xs text-ink-muted">目安スコア</span>
          <span className="font-heading text-5xl font-bold text-primary">
            {result.overallScoreEstimate}
          </span>
          <span className="text-[13px] text-ink-muted">
            {result.correctCount} / {result.totalCount}問正解 ・ +{result.xp} XP
          </span>
        </div>

        <div className="flex flex-col gap-2.5">
          {result.partAccuracy.map(({ part, correct, total }) => {
            const pct = total > 0 ? Math.round((correct / total) * 100) : 0;
            const barColor = pct >= 70 ? "bg-success" : pct >= 40 ? "bg-accent" : "bg-danger";
            return (
              <div key={part} className="flex flex-col gap-1">
                <div className="flex items-center justify-between text-xs text-ink-muted">
                  <span>{part === "part5" ? "Part5" : "Part6"}</span>
                  <span>{pct}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-primary-soft">
                  <div className={`h-full rounded-full ${barColor}`} style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>

        <Link
          href="/dashboard"
          className="h-[42px] rounded-[10px] bg-primary text-center text-[13px] font-bold leading-[42px] text-white no-underline"
        >
          ダッシュボードに戻る
        </Link>
      </div>
    );
  }

  return null;
}
