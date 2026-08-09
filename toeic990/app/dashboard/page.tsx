import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import DashboardHeader from "@/components/DashboardHeader";
import { DEFAULT_DAILY_GOAL } from "@/types";

export default async function DashboardPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div>
      <DashboardHeader email={user.email ?? ""} />
      <main className="mx-auto flex max-w-3xl flex-col gap-6 px-6 py-8">
        <h1 className="text-2xl font-bold">ダッシュボード</h1>

        <section className="rounded-lg border border-slate-200 p-6">
          <h2 className="text-lg font-semibold">今日の学習目標</h2>
          <p className="mt-2 text-3xl font-bold">{DEFAULT_DAILY_GOAL}枚</p>
          <p className="mt-1 text-sm text-slate-500">
            単語・文法カードの復習目標（デフォルト値、後日設定変更に対応予定）
          </p>
        </section>

        <section className="rounded-lg border border-slate-200 p-6">
          <h2 className="text-lg font-semibold">学習メニュー</h2>
          <ul className="mt-3 flex flex-col gap-2 text-sm">
            <li>
              <Link href="/vocab" className="text-slate-900 underline">
                単語・文法SRS学習
              </Link>
            </li>
            <li className="text-slate-500">模試形式演習（準備中）</li>
            <li className="text-slate-500">リスニング（準備中）</li>
            <li className="text-slate-500">弱点分析（準備中）</li>
          </ul>
        </section>
      </main>
    </div>
  );
}
