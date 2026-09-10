"use client";

import type { QuizAnswerResult } from "@/types/session";

type Props = {
  result: QuizAnswerResult;
};

// 回答直後の即時フィードバック。
// 正解時は短いアニメーションのみ、不正解時は正解と1行解説を出す。
// このコンポーネントは回答後にしかマウントされないため、解説が事前にDOMへ入ることはない。
export default function AnswerFeedback({ result }: Props) {
  if (result.isCorrect) {
    return (
      <div
        role="status"
        className="flex animate-pop items-center justify-center gap-3 rounded-xl2 bg-success-soft px-5 py-5"
      >
        <svg
          width="34"
          height="34"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-success-text"
        >
          <path d="M4 12.5l5 5L20 6" />
        </svg>
        <span className="text-[26px] font-bold text-success-text">正解！ +{result.xp} XP</span>
      </div>
    );
  }

  return (
    <div role="status" className="flex flex-col gap-2.5 rounded-xl2 bg-danger-soft px-5 py-5">
      <div className="text-[20px] font-bold text-danger-text">正解</div>
      <div className="text-[26px] font-bold text-ink">{result.correctMeaning}</div>
      {result.explanation && (
        <p className="text-[20px] leading-relaxed text-ink-muted">{result.explanation}</p>
      )}
    </div>
  );
}
