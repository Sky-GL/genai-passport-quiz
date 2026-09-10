import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getActiveSession, getScoreEstimate } from "@/lib/supabase/session";
import { MIN_SAMPLE_FOR_ESTIMATE } from "@/lib/score-estimate";
import { SESSION_SIZE } from "@/types/session";

export default async function Home() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [active, estimate] = await Promise.all([
    getActiveSession(user.id),
    getScoreEstimate(user.id),
  ]);
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

      <div className="flex flex-col gap-3 rounded-xl2 bg-surface p-6 shadow-card">
        <div className="text-[18px] font-bold uppercase tracking-[0.1em] text-ink-faint">
          予想スコア
        </div>
        {estimate ? (
          <>
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <span className="font-heading text-[52px] font-bold leading-none text-primary">
                {estimate.score}
              </span>
              <span className="text-[22px] font-medium text-ink-muted">/ 990</span>
              {estimate.gapTo990 > 0 && (
                <span className="shrink-0 rounded-md bg-accent-soft px-2.5 py-1 text-[18px] font-bold text-accent-text">
                  990まで {estimate.gapTo990}点
                </span>
              )}
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-primary-soft">
              <div
                className="h-full rounded-full bg-primary transition-all duration-500 ease-spring"
                style={{ width: `${estimate.weightedAccuracy}%` }}
              />
            </div>
            <p className="text-[18px] leading-relaxed text-ink-muted">
              直近{estimate.sampleSize}問の語彙問題（難易度で重みづけした正答率
              {estimate.weightedAccuracy}%）からの目安です。
            </p>
          </>
        ) : (
          <p className="text-[20px] leading-relaxed text-ink-muted">
            語彙問題に{MIN_SAMPLE_FOR_ESTIMATE}問以上答えると、予想スコアが出ます。
          </p>
        )}
      </div>

      <Link
        href="/dashboard"
        className="text-center text-[18px] text-ink-muted no-underline transition-all duration-300 hover:text-ink"
      >
        ダッシュボードを見る
      </Link>
    </main>
  );
}
