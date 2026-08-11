"use client";

import type { Choice, MockTestPassage, MockTestQuestionPublic } from "@/types/mocktest";

const CHOICE_KEYS: Choice[] = ["A", "B", "C", "D"];

export type QuestionFeedback = {
  isCorrect: boolean;
  correctChoice: Choice;
  explanation: string;
};

type Props = {
  question: MockTestQuestionPublic;
  passage: MockTestPassage | null;
  selected: Choice | null;
  feedback: QuestionFeedback | null;
  onSelect: (choice: Choice) => void;
};

export default function MockTestQuestionCard({
  question,
  passage,
  selected,
  feedback,
  onSelect,
}: Props) {
  const choices: Record<Choice, string> = {
    A: question.choice_a,
    B: question.choice_b,
    C: question.choice_c,
    D: question.choice_d,
  };

  return (
    <div className="flex w-full max-w-[560px] flex-col gap-4 rounded-xl2 border border-border bg-surface p-[26px] shadow-card">
      {passage && (
        <div className="flex flex-col gap-1.5 rounded-[11px] bg-[oklch(0.96_0.008_265)] p-4">
          <div className="text-[11px] font-bold text-ink-muted">{passage.title}</div>
          <pre className="whitespace-pre-wrap font-sans text-[13px] leading-relaxed text-ink">
            {passage.passage_text}
          </pre>
        </div>
      )}

      <p className="text-[15px] leading-relaxed text-ink">{question.question_text}</p>

      <div className="flex flex-col gap-2.5">
        {CHOICE_KEYS.map((key) => {
          const isSelected = selected === key;
          const isCorrectChoice = feedback?.correctChoice === key;
          let stateClass = isSelected
            ? "border-primary bg-primary-soft text-primary-dark"
            : "border-border text-ink";
          if (feedback) {
            if (isCorrectChoice) {
              stateClass = "border-success bg-success-soft text-success-text";
            } else if (isSelected) {
              stateClass = "border-danger bg-danger-soft text-danger-text";
            } else {
              stateClass = "border-border text-ink";
            }
          }

          return (
            <button
              key={key}
              type="button"
              disabled={!!feedback}
              onClick={() => onSelect(key)}
              className={`flex items-center gap-2.5 rounded-[11px] border-[1.5px] px-4 py-3 text-left text-sm disabled:cursor-default ${stateClass}`}
            >
              <span className="font-heading text-xs font-bold text-ink-faint">{key}</span>
              <span className="flex-1">{choices[key]}</span>
              {feedback && isSelected && !isCorrectChoice && (
                <span className="text-[11px] font-bold">あなたの回答</span>
              )}
              {feedback && isCorrectChoice && <span className="text-[11px] font-bold">正解</span>}
            </button>
          );
        })}
      </div>

      {feedback && !feedback.isCorrect && (
        <div className="flex flex-col gap-1.5 rounded-[11px] bg-[oklch(0.96_0.008_265)] px-4 py-3">
          <div className="text-[12.5px] font-bold text-ink">解説</div>
          <div className="text-[13px] leading-relaxed text-ink-muted">{feedback.explanation}</div>
        </div>
      )}
    </div>
  );
}
