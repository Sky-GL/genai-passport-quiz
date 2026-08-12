import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getDueVocabCards, getVocabCategories, getWeakVocabCards } from "@/lib/supabase/vocab";
import { getIncorrectGrammarQuestions, getUnansweredGrammarQuestions } from "@/lib/supabase/grammar";
import VocabSession from "@/components/VocabSession";
import GrammarSession from "@/components/GrammarSession";
import { DEFAULT_DAILY_GOAL } from "@/types";

type Props = {
  searchParams: { category?: string; mode?: string; weak?: string };
};

const GRAMMAR_BATCH_SIZE = 15;

export default async function VocabPage({ searchParams }: Props) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const mode = searchParams.mode === "grammar" ? "grammar" : "vocab";
  const category = searchParams.category;
  const weak = searchParams.weak === "1";
  const modeQuery = mode === "grammar" ? "?mode=grammar" : "";

  return (
    <main className="mx-auto flex max-w-3xl flex-col items-center gap-7 px-8 py-12">
      <div className="flex w-full max-w-[420px] items-center justify-between">
        <h1 className="font-heading text-lg font-bold text-ink">単語・文法SRS</h1>
        <Link href="/dashboard" className="text-[13px] text-ink-muted no-underline">
          ダッシュボードへ戻る
        </Link>
      </div>

      <div className="flex w-full max-w-[420px] gap-2 border-b border-border/60">
        <Link
          href="/vocab"
          className={`px-1 pb-2.5 text-sm font-bold no-underline transition-all duration-300 ease-spring ${
            mode === "vocab" ? "border-b-2 border-primary text-primary" : "text-ink-muted hover:text-ink"
          }`}
        >
          単語
        </Link>
        <Link
          href="/vocab?mode=grammar"
          className={`px-1 pb-2.5 text-sm font-bold no-underline transition-all duration-300 ease-spring ${
            mode === "grammar" ? "border-b-2 border-primary text-primary" : "text-ink-muted hover:text-ink"
          }`}
        >
          文法
        </Link>
      </div>

      <div className="flex w-full max-w-[420px] gap-1.5">
        <Link
          href={modeQuery || "/vocab"}
          className={`rounded-full px-3 py-1 text-xs font-bold no-underline transition-all duration-300 ease-spring hover:scale-[0.98] ${
            !weak ? "bg-primary text-white" : "bg-primary-soft text-primary-dark"
          }`}
        >
          通常
        </Link>
        <Link
          href={`/vocab${modeQuery ? `${modeQuery}&weak=1` : "?weak=1"}`}
          className={`rounded-full px-3 py-1 text-xs font-bold no-underline transition-all duration-300 ease-spring hover:scale-[0.98] ${
            weak ? "bg-danger text-white" : "bg-danger-soft text-danger-text"
          }`}
        >
          苦手復習
        </Link>
      </div>

      {mode === "vocab" ? (
        <VocabModeContent category={category} weak={weak} />
      ) : (
        <GrammarModeContent weak={weak} />
      )}
    </main>
  );
}

async function VocabModeContent({ category, weak }: { category?: string; weak: boolean }) {
  const [cards, categories] = await Promise.all([
    weak ? getWeakVocabCards(DEFAULT_DAILY_GOAL) : getDueVocabCards(DEFAULT_DAILY_GOAL, category),
    getVocabCategories(),
  ]);

  return (
    <>
      {!weak && categories.length > 0 && (
        <div className="flex w-full max-w-[340px] flex-wrap gap-1.5">
          <Link
            href="/vocab"
            className={`rounded-full px-3 py-1 text-xs font-bold no-underline transition-all duration-300 ease-spring hover:scale-[0.98] ${
              !category ? "bg-primary text-white" : "bg-primary-soft text-primary-dark"
            }`}
          >
            すべて
          </Link>
          {categories.map((c) => (
            <Link
              key={c}
              href={`/vocab?category=${encodeURIComponent(c)}`}
              className={`rounded-full px-3 py-1 text-xs font-bold no-underline transition-all duration-300 ease-spring hover:scale-[0.98] ${
                category === c ? "bg-primary text-white" : "bg-primary-soft text-primary-dark"
              }`}
            >
              {c}
            </Link>
          ))}
        </div>
      )}

      {cards.length === 0 ? (
        <p className="py-16 text-center text-ink-muted">
          {weak ? "苦手な単語はまだありません。" : "本日復習予定のカードはありません。"}
        </p>
      ) : (
        <VocabSession key={weak ? "weak" : category ?? "all"} cards={cards} />
      )}
    </>
  );
}

async function GrammarModeContent({ weak }: { weak: boolean }) {
  const questions = weak
    ? await getIncorrectGrammarQuestions(GRAMMAR_BATCH_SIZE)
    : await getUnansweredGrammarQuestions(GRAMMAR_BATCH_SIZE);

  if (questions.length === 0) {
    return (
      <p className="py-16 text-center text-ink-muted">
        {weak
          ? "誤答した文法問題はまだありません。"
          : "すべての文法問題に回答済みです。お疲れさまでした。"}
      </p>
    );
  }

  return <GrammarSession key={weak ? "weak" : "all"} questions={questions} />;
}
