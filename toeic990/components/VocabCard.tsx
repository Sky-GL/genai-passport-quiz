"use client";

type Props = {
  front: string;
  back: string;
  category: string | null;
  relatedWords: string | null;
  collocation: string | null;
  flipped: boolean;
  onFlip: () => void;
};

function splitBack(back: string): { meaning: string; example: string } {
  const [meaning, ...rest] = back.split("　例:");
  return { meaning: meaning.trim(), example: rest.join("　例:").trim() };
}

export default function VocabCard({
  front,
  back,
  category,
  relatedWords,
  collocation,
  flipped,
  onFlip,
}: Props) {
  const { meaning, example } = splitBack(back);
  const relatedList = relatedWords
    ? relatedWords.split(",").map((w) => w.trim()).filter(Boolean)
    : [];

  return (
    <button
      type="button"
      onClick={onFlip}
      className="relative flex min-h-[280px] w-full max-w-[340px] flex-col items-center justify-center gap-2.5 rounded-xl2 border border-border bg-surface p-6 text-center shadow-card transition hover:border-primary-soft"
    >
      {category && (
        <span className="absolute left-4 top-4 rounded-full bg-primary-soft px-2.5 py-0.5 text-[10.5px] font-bold text-primary-dark">
          {category}
        </span>
      )}

      {flipped ? (
        <div className="flex w-full flex-col gap-3 pt-4 text-left">
          <div className="font-heading text-[22px] font-bold text-ink">{front}</div>
          {meaning && (
            <div className="font-sans text-[15px] font-bold text-primary">{meaning}</div>
          )}
          {example && (
            <div className="text-[13px] leading-relaxed text-ink-muted">{example}</div>
          )}
          {relatedList.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {relatedList.map((word) => (
                <span
                  key={word}
                  className="rounded-full bg-page px-2.5 py-1 text-[11.5px] font-medium text-ink-muted"
                >
                  {word}
                </span>
              ))}
            </div>
          )}
          {collocation && (
            <div className="rounded-lg bg-page px-3 py-2 text-[12px] leading-relaxed text-ink-muted">
              <span className="font-bold text-ink">よく使う形　</span>
              {collocation}
            </div>
          )}
        </div>
      ) : (
        <>
          <p className="font-heading text-[34px] font-bold text-ink">{front}</p>
          <span className="text-[12.5px] text-ink-faint">タップして意味を表示</span>
        </>
      )}
    </button>
  );
}
