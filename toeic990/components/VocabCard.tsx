"use client";

type Props = {
  front: string;
  back: string;
  category: string | null;
  relatedWords: string | null;
  collocation: string | null;
  etymology: string | null;
  wordFamily: string | null;
  toeicLevel: number | null;
  flipped: boolean;
  onFlip: () => void;
};

function DifficultyStars({ level }: { level: number }) {
  return (
    <span className="flex items-center gap-0.5" title={`TOEIC難易度 ${level}/5`}>
      {Array.from({ length: 5 }, (_, i) => (
        <svg
          key={i}
          width="11"
          height="11"
          viewBox="0 0 24 24"
          fill={i < level ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth="1.5"
          className={i < level ? "text-accent" : "text-border"}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 3.5l2.6 5.34 5.9.86-4.27 4.16 1.01 5.88L12 17.02l-5.24 2.72 1.01-5.88-4.27-4.16 5.9-.86L12 3.5Z"
          />
        </svg>
      ))}
    </span>
  );
}

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
  etymology,
  wordFamily,
  toeicLevel,
  flipped,
  onFlip,
}: Props) {
  const { meaning, example } = splitBack(back);
  const relatedList = relatedWords
    ? relatedWords.split(",").map((w) => w.trim()).filter(Boolean)
    : [];
  const familyList = wordFamily
    ? wordFamily.split(",").map((w) => w.trim()).filter(Boolean)
    : [];

  return (
    <button
      type="button"
      onClick={onFlip}
      className="relative flex min-h-[280px] w-full max-w-[340px] flex-col items-center justify-center gap-2.5 rounded-xl2 bg-surface p-7 text-center shadow-card transition-all duration-300 ease-spring hover:-translate-y-0.5 hover:shadow-hover"
    >
      {category && (
        <span className="absolute left-4 top-4 rounded-full bg-primary-soft px-2.5 py-0.5 text-[10.5px] font-bold text-primary-dark">
          {category}
        </span>
      )}
      {toeicLevel && <span className="absolute right-4 top-4"><DifficultyStars level={toeicLevel} /></span>}

      {flipped ? (
        <div className="flex w-full flex-col gap-3 pt-4 text-left">
          <div className="font-heading text-[26px] font-bold text-ink">{front}</div>
          {meaning && (
            <div className="font-sans text-[17px] font-bold text-primary">{meaning}</div>
          )}
          {example && (
            <div className="text-[15px] leading-relaxed text-ink-muted">{example}</div>
          )}
          {relatedList.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {relatedList.map((word) => (
                <span
                  key={word}
                  className="rounded-full bg-page px-2.5 py-1 text-[13px] font-medium text-ink-muted"
                >
                  {word}
                </span>
              ))}
            </div>
          )}
          {collocation && (
            <div className="rounded-lg bg-page px-3 py-2 text-[14px] leading-relaxed text-ink-muted">
              <span className="font-bold text-ink">よく使う形　</span>
              {collocation}
            </div>
          )}
          {etymology && (
            <div className="rounded-lg bg-primary-soft px-3 py-2 text-[14px] leading-relaxed text-primary-dark">
              <span className="font-bold">語源　</span>
              {etymology}
            </div>
          )}
          {familyList.length > 0 && (
            <div className="flex flex-col gap-1">
              <span className="text-[12.5px] font-bold text-ink-muted">同語源の派生語</span>
              <div className="flex flex-wrap gap-1.5">
                {familyList.map((word) => (
                  <span
                    key={word}
                    className="rounded-full border border-primary-soft px-2.5 py-1 text-[13px] font-medium text-primary-dark"
                  >
                    {word}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <>
          <p className="font-heading text-[38px] font-bold text-ink">{front}</p>
          <span className="text-[14px] text-ink-faint">タップして意味を表示</span>
        </>
      )}
    </button>
  );
}
