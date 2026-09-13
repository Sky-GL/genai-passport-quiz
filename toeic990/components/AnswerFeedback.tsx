"use client";

import type { QuizAnswerResult } from "@/types/session";

type Props = {
  result: QuizAnswerResult;
};

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[16px] font-bold uppercase tracking-[0.08em] text-ink-faint">
        {label}
      </span>
      <span className="break-words text-[19px] leading-relaxed text-ink-muted">{value}</span>
    </div>
  );
}

// 回答直後の即時フィードバック。正誤にかかわらず、正解の語・品詞・発音記号・意味・
// 完成文・よく使う形を出す(正解したときも意味を確認できないと単語学習にならない)。
// 語源などの深い情報は既定で畳み、テンポを落とさずに見られるようにしている。
// このコンポーネントは回答後にしかマウントされないため、正解が事前にDOMへ入ることはない。
export default function AnswerFeedback({ result }: Props) {
  const correct = result.isCorrect;
  const tone = correct
    ? { box: "bg-success-soft", text: "text-success-text" }
    : { box: "bg-danger-soft", text: "text-danger-text" };

  const hasDeepDetail = !!(result.etymology || result.relatedWords || result.wordFamily);

  return (
    <div
      role="status"
      className={`flex flex-col gap-3 rounded-xl2 px-5 py-5 ${tone.box} ${
        correct ? "animate-pop" : ""
      }`}
    >
      <div className={`flex items-center gap-2.5 ${tone.text}`}>
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="shrink-0"
        >
          {correct ? <path d="M4 12.5l5 5L20 6" /> : <path d="M6 6l12 12M18 6L6 18" />}
        </svg>
        <span className="text-[24px] font-bold">
          {correct ? `正解！ +${result.xp} XP` : "不正解"}
        </span>
      </div>

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
        <p className="break-words text-[20px] leading-relaxed text-ink">
          {result.completedSentence}
        </p>
      )}

      {result.collocation && <DetailRow label="よく使う形" value={result.collocation} />}

      {hasDeepDetail && (
        <details className="group">
          <summary className="cursor-pointer list-none text-[18px] font-bold text-ink-muted underline underline-offset-4">
            <span className="group-open:hidden">語源・関連語を見る</span>
            <span className="hidden group-open:inline">閉じる</span>
          </summary>
          <div className="mt-3 flex flex-col gap-3">
            {result.etymology && <DetailRow label="語源" value={result.etymology} />}
            {result.relatedWords && <DetailRow label="類義語" value={result.relatedWords} />}
            {result.wordFamily && <DetailRow label="語形変化" value={result.wordFamily} />}
          </div>
        </details>
      )}
    </div>
  );
}
