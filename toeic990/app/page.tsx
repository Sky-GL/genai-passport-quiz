import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getActiveSession } from "@/lib/supabase/session";
import { SESSION_SIZE } from "@/types/session";

export default async function Home() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const active = await getActiveSession(user.id);
  const answered = active?.answeredCount ?? 0;
  const remaining = SESSION_SIZE - answered;
  const resuming = active !== null;

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center gap-5 px-5 py-10 sm:px-8">
      <Link
        href="/vocab/session"
        className="relative flex flex-col gap-5 overflow-hidden rounded-xl3 bg-gradient-to-br from-primary via-primary to-navy p-8 text-white no-underline shadow-hero transition-all duration-300 ease-spring hover:scale-[0.99]"
      >
        <div className="pointer-events-none absolute -right-12 -top-16 h-56 w-56 rounded-full bg-accent/25 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 -left-10 h-40 w-40 rounded-full bg-white/10 blur-3xl" />

        <div className="relative text-[18px] font-bold uppercase tracking-[0.1em] opacity-80">
          今日の学習
        </div>

        <div className="relative flex items-baseline gap-3">
          <span className="font-heading text-7xl font-bold">{remaining}</span>
          <span className="text-[26px] font-medium opacity-85">問</span>
        </div>

        {resuming && (
          <div className="relative h-2 overflow-hidden rounded-full bg-white/20">
            <div
              className="h-full rounded-full bg-white"
              style={{ width: `${(answered / SESSION_SIZE) * 100}%` }}
            />
          </div>
        )}

        <div className="relative flex h-[62px] items-center justify-center rounded-[10px] bg-white text-[24px] font-bold text-primary-dark">
          {resuming ? "続きから" : "はじめる"}
        </div>
      </Link>

      <Link
        href="/dashboard"
        className="text-center text-[18px] text-ink-muted no-underline transition-all duration-300 hover:text-ink"
      >
        ダッシュボードを見る
      </Link>
    </main>
  );
}
