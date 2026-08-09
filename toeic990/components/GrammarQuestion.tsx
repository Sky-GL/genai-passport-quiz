"use client";

import type { Choice, GrammarQuestionPublic, GrammarAnswerResult } from "@/types/grammar";

const CHOICE_KEYS: Choice[] = ["A", "B", "C", "D"];

type Props = {
  question: GrammarQuestionPublic;
  index: number;
  total: number;
  selected: Choice | null;
  result: GrammarAnswerResult | null;
  onSelect: (choice: Choice) => void;
};

export default function GrammarQuestion({ question, index, total, selected, result, onSelect }: Props) {
  const choices: Record<Choice, string> = {
    A: question.choice_a,
    B: question.choice_b,
    C: question.choice_c,
    D: question.choice_d,
  };

  return (
    <div className="flex w-full max-w-[420px] flex-col gap-[18px] rounded-xl2 border border-border bg-surface p-[26px] shadow-card">
      <div className="flex items-center justify-between text-xs text-ink-muted">
        <span>文法問題 ・ {index} / {total}問</span>
        <span>{question.category}</span>
      </div>

      <p className="text-[15px] leading-relaxed text-ink">{question.question_text}</p>

      <div className="flex flex-col gap-2.5">
        {CHOICE_KEYS.map((key) => {
          const isSelected = selected === key;
          const isCorrectChoice = result?.correctChoice === key;
          let stateClass = "border-border text-ink";
          if (result) {
            if (isCorrectChoice) {
              stateClass = "border-success bg-success-soft text-success-text";
            } else if (isSelected) {
              stateClass = "border-danger bg-danger-soft text-danger-text";
            }
          }

          return (
            <button
              key={key}
              type="button"
              disabled={!!result}
              onClick={() => onSelect(key)}
              className={`flex items-center gap-2.5 rounded-[11px] border-[1.5px] px-4 py-3 text-left text-sm disabled:cursor-default ${stateClass}`}
            >
              <span className="font-heading text-xs font-bold text-ink-faint">{key}</span>
              <span className="flex-1">{choices[key]}</span>
              {result && isSelected && !isCorrectChoice && (
                <span className="text-[11px] font-bold">あなたの回答</span>
              )}
              {result && isCorrectChoice && <span className="text-[11px] font-bold">正解</span>}
            </button>
          );
        })}
      </div>

      {result && !result.isCorrect && (
        <div className="flex flex-col gap-1.5 rounded-[11px] bg-[oklch(0.96_0.008_265)] px-4 py-3">
          <div className="text-[12.5px] font-bold text-ink">解説</div>
          <div className="text-[13px] leading-relaxed text-ink-muted">{result.explanation}</div>
        </div>
      )}
    </div>
  );
}
