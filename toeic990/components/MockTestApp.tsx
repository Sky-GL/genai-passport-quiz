"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import type { Choice, MockTestResult, MockTestSet, Mode } from "@/types/mocktest";
import { checkMockTestAnswerAction, submitMockTest } from "@/app/mock-test/actions";
import MockTestQuestionCard, { type QuestionFeedback } from "./MockTestQuestionCard";

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
  const [feedback, setFeedback] = useState<Record<string, QuestionFeedback>>({});
  const [result, setResult] = useState<MockTestResult | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isChecking, startChecking] = useTransition();
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
    setFeedback({});
    setPhase("session");
  };

  const handleSelect = (questionId: string, choice: Choice) => {
    setAnswers((a) => ({ ...a, [questionId]: choice }));
    if (mode === "practice" && !feedback[questionId] && !isChecking) {
      startChecking(async () => {
        const res = await checkMockTestAnswerAction(questionId, choice);
        setFeedback((f) => ({ ...f, [questionId]: res }));
      });
    }
  };

  if (phase === "select") {
    return (
      <div className="flex w-full max-w-[420px] flex-col gap-6 rounded-xl2 bg-surface p-7 shadow-card">
        <div className="flex flex-col gap-3">
          {(["practice", "timed"] as Mode[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={`flex items-center gap-3 rounded-[11px] border px-4 py-3 text-left transition-all duration-300 ease-spring ${
                mode === m ? "border-primary bg-primary-soft" : "border-border/50 hover:border-primary/30"
              }`}
            >
              <span
                className={`h-4 w-4 shrink-0 rounded-full border-2 transition-all duration-300 ${
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
          className="h-[46px] rounded-[10px] bg-primary text-sm font-bold text-white transition-all duration-300 ease-spring hover:scale-[0.98] hover:bg-primary-dark"
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
        <div className="flex w-full max-w-[560px] items-center justify-between rounded-xl2 bg-navy px-5 py-3.5 text-white">
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
          feedback={feedback[current.id] ?? null}
          onSelect={(choice) => handleSelect(current.id, choice)}
        />

        <div className="flex w-full max-w-[560px] justify-between">
          <button
            type="button"
            disabled={index === 0}
            onClick={() => setIndex((i) => i - 1)}
            className="h-[42px] rounded-[10px] px-5 text-[13px] font-bold text-ink shadow-flat transition-all duration-300 ease-spring hover:scale-[0.98] disabled:opacity-40 disabled:hover:scale-100"
          >
            前へ
          </button>
          {isLast ? (
            <button
              type="button"
              disabled={isPending}
              onClick={handleSubmit}
              className="h-[42px] rounded-[10px] bg-primary px-5 text-[13px] font-bold text-white transition-all duration-300 ease-spring hover:scale-[0.98] hover:bg-primary-dark disabled:opacity-50 disabled:hover:scale-100"
            >
              {isPending ? "採点中..." : "採点する"}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setIndex((i) => i + 1)}
              className="h-[42px] rounded-[10px] bg-primary px-5 text-[13px] font-bold text-white transition-all duration-300 ease-spring hover:scale-[0.98] hover:bg-primary-dark"
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
      <div className="flex w-full max-w-[420px] flex-col gap-6 rounded-xl3 bg-surface p-7 shadow-hero">
        <div className="relative flex flex-col items-center gap-1 overflow-hidden rounded-xl2 bg-primary-soft py-6 text-center">
          <div className="pointer-events-none absolute -top-10 h-32 w-32 rounded-full bg-primary/20 blur-3xl" />
          <span className="relative text-[10px] font-bold uppercase tracking-[0.18em] text-primary-dark/70">
            目安スコア
          </span>
          <span className="relative font-heading text-6xl font-bold text-primary">
            {result.overallScoreEstimate}
          </span>
          <span className="relative text-[13px] text-primary-dark/80">
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
                  <div
                    className={`h-full rounded-full transition-all duration-500 ease-spring ${barColor}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        <Link
          href="/dashboard"
          className="h-[42px] rounded-[10px] bg-primary text-center text-[13px] font-bold leading-[42px] text-white no-underline transition-all duration-300 ease-spring hover:scale-[0.98]"
        >
          ダッシュボードに戻る
        </Link>
      </div>
    );
  }

  return null;
}
