"use client";

type Props = {
  front: string;
  back: string;
  flipped: boolean;
  onFlip: () => void;
};

function splitBack(back: string): { meaning: string; example: string } {
  const [meaning, ...rest] = back.split("　例:");
  return { meaning: meaning.trim(), example: rest.join("　例:").trim() };
}

export default function VocabCard({ front, back, flipped, onFlip }: Props) {
  const { meaning, example } = splitBack(back);

  return (
    <button
      type="button"
      onClick={onFlip}
      className="flex h-[280px] w-full max-w-[340px] flex-col items-center justify-center gap-2.5 rounded-xl2 border border-border bg-surface p-6 text-center shadow-card transition hover:border-primary-soft"
    >
      {flipped ? (
        <div className="flex flex-col gap-3.5 text-left">
          <div className="font-heading text-[22px] font-bold text-ink">{front}</div>
          {meaning && (
            <div className="font-sans text-[15px] font-bold text-primary">{meaning}</div>
          )}
          {example && (
            <div className="text-[13px] leading-relaxed text-ink-muted">{example}</div>
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
