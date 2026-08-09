import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getDueVocabCards, getVocabCategories } from "@/lib/supabase/vocab";
import VocabSession from "@/components/VocabSession";
import { DEFAULT_DAILY_GOAL } from "@/types";

type Props = {
  searchParams: { category?: string };
};

export default async function VocabPage({ searchParams }: Props) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const category = searchParams.category;
  const [cards, categories] = await Promise.all([
    getDueVocabCards(DEFAULT_DAILY_GOAL, category),
    getVocabCategories(),
  ]);

  return (
    <main className="mx-auto flex max-w-3xl flex-col items-center gap-6 px-6 py-8">
      <div className="flex w-full max-w-[340px] items-center justify-between">
        <h1 className="font-heading text-lg font-bold text-ink">単語・文法SRS</h1>
        <Link href="/dashboard" className="text-[13px] text-ink-muted no-underline">
          ダッシュボードへ戻る
        </Link>
      </div>

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
    </main>
  );
}
