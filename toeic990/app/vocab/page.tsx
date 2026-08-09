import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getDueVocabCards } from "@/lib/supabase/vocab";
import VocabSession from "@/components/VocabSession";
import { DEFAULT_DAILY_GOAL } from "@/types";

export default async function VocabPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const cards = await getDueVocabCards(DEFAULT_DAILY_GOAL);

  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-6 px-6 py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">単語・文法SRS学習</h1>
        <Link href="/dashboard" className="text-sm text-slate-500 underline">
          ダッシュボードへ戻る
        </Link>
      </div>

      {cards.length === 0 ? (
        <p className="py-16 text-center text-slate-500">
          本日復習予定のカードはありません。
        </p>
      ) : (
        <VocabSession cards={cards} />
      )}
    </main>
  );
}
