"use client";

type Props = {
  front: string;
  back: string;
  flipped: boolean;
  onFlip: () => void;
};

export default function VocabCard({ front, back, flipped, onFlip }: Props) {
  return (
    <button
      type="button"
      onClick={onFlip}
      className="flex h-64 w-full max-w-md flex-col items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm transition hover:border-slate-300"
    >
      {flipped ? (
        <p className="whitespace-pre-wrap text-lg text-slate-700">{back}</p>
      ) : (
        <p className="text-3xl font-bold">{front}</p>
      )}
      {!flipped && (
        <span className="mt-4 text-xs text-slate-400">タップして意味を表示</span>
      )}
    </button>
  );
}
