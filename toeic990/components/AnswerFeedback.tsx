"use client";

import type { QuizAnswerResult } from "@/types/session";

type Props = {
  result: QuizAnswerResult;
};

// 回答直後の即時フィードバック。
// 正解時は短いアニメーションのみ、不正解時は正解の語・意味・完成文を出す。
// このコンポーネントは回答後にしかマウントされないため、正解が事前にDOMへ入ることはない。
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
      <div className="flex w-full flex-wrap items-baseline gap-x-3 gap-y-1">
        <span className="break-words font-heading text-[30px] font-bold text-ink">
          {result.correctWord}
        </span>
        {result.partOfSpeech && (
          <span className="shrink-0 rounded-md bg-accent-soft px-2.5 py-1 text-[17px] font-bold text-accent-text">
            {result.partOfSpeech}
          </span>
        )}
        {result.pronunciation && (
          <span className="text-[20px] text-ink-muted">{result.pronunciation}</span>
        )}
      </div>
      <div className="text-[24px] font-bold text-ink">{result.meaning}</div>
      {result.completedSentence && (
        <p className="text-[20px] leading-relaxed text-ink-muted">{result.completedSentence}</p>
      )}
    </div>
  );
}
