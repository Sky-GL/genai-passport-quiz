import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getMockTestSet } from "@/lib/supabase/mocktest";
import MockTestApp from "@/components/MockTestApp";

export default async function MockTestPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { questions, passages } = await getMockTestSet();

  return (
    <main className="mx-auto flex max-w-3xl flex-col items-center gap-6 px-6 py-8">
      <div className="flex w-full max-w-[560px] items-center justify-between">
        <h1 className="font-heading text-lg font-bold text-ink">模試形式演習</h1>
        <Link href="/dashboard" className="text-[13px] text-ink-muted no-underline">
          ダッシュボードへ戻る
        </Link>
      </div>

      {questions.length === 0 ? (
        <p className="py-16 text-center text-ink-muted">問題が登録されていません。</p>
      ) : (
        <MockTestApp questions={questions} passages={passages} />
      )}
    </main>
  );
}
