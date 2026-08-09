import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getDueVocabCards, getVocabCategories } from "@/lib/supabase/vocab";
import { getUnansweredGrammarQuestions } from "@/lib/supabase/grammar";
import VocabSession from "@/components/VocabSession";
import GrammarSession from "@/components/GrammarSession";
import { DEFAULT_DAILY_GOAL } from "@/types";

type Props = {
  searchParams: { category?: string; mode?: string };
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

  return (
    <main className="mx-auto flex max-w-3xl flex-col items-center gap-6 px-6 py-8">
      <div className="flex w-full max-w-[420px] items-center justify-between">
        <h1 className="font-heading text-lg font-bold text-ink">単語・文法SRS</h1>
        <Link href="/dashboard" className="text-[13px] text-ink-muted no-underline">
          ダッシュボードへ戻る
        </Link>
      </div>

      <div className="flex w-full max-w-[420px] gap-2 border-b border-border">
        <Link
          href="/vocab"
          className={`px-1 pb-2.5 text-sm font-bold no-underline ${
            mode === "vocab" ? "border-b-2 border-primary text-primary" : "text-ink-muted"
          }`}
        >
          単語
        </Link>
        <Link
          href="/vocab?mode=grammar"
          className={`px-1 pb-2.5 text-sm font-bold no-underline ${
            mode === "grammar" ? "border-b-2 border-primary text-primary" : "text-ink-muted"
          }`}
        >
          文法
        </Link>
      </div>

      {mode === "vocab" ? (
        <VocabModeContent userId={user.id} category={category} />
      ) : (
        <GrammarModeContent />
      )}
    </main>
  );
}

async function VocabModeContent({ category }: { userId: string; category?: string }) {
  const [cards, categories] = await Promise.all([
    getDueVocabCards(DEFAULT_DAILY_GOAL, category),
    getVocabCategories(),
  ]);

  return (
    <>
      {categories.length > 0 && (
        <div className="flex w-full max-w-[340px] flex-wrap gap-1.5">
          <Link
            href="/vocab"
            className={`rounded-full px-3 py-1 text-xs font-bold no-underline ${
              !category ? "bg-primary text-white" : "bg-primary-soft text-primary-dark"
            }`}
          >
            すべて
          </Link>
          {categories.map((c) => (
            <Link
              key={c}
              href={`/vocab?category=${encodeURIComponent(c)}`}
              className={`rounded-full px-3 py-1 text-xs font-bold no-underline ${
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
          本日復習予定のカードはありません。
        </p>
      ) : (
        <VocabSession key={category ?? "all"} cards={cards} />
      )}
    </>
  );
}

async function GrammarModeContent() {
  const questions = await getUnansweredGrammarQuestions(GRAMMAR_BATCH_SIZE);

  if (questions.length === 0) {
    return (
      <p className="py-16 text-center text-ink-muted">
        すべての文法問題に回答済みです。お疲れさまでした。
      </p>
    );
  }

  return <GrammarSession questions={questions} />;
}
