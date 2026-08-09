import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getDueVocabCardCount } from "@/lib/supabase/vocab";
import { getTodayActivity, getUserStats, getWeeklyActivity } from "@/lib/supabase/gamification";
import { levelFromXp } from "@/lib/gamification";
import DashboardHeader from "@/components/DashboardHeader";
import WeeklyXpChart from "@/components/WeeklyXpChart";
import { DEFAULT_DAILY_GOAL } from "@/types";

const MENU_ITEMS = [
  { key: "vocab", label: "単語SRS", href: "/vocab", active: true },
  { key: "mock-test", label: "模試", href: "/mock-test", active: false },
  { key: "listening", label: "リスニング", href: "/listening", active: false },
  { key: "analytics", label: "弱点分析", href: "/analytics", active: false },
] as const;

export default async function DashboardPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [dueCount, userStats, weeklyActivity, todayActivity] = await Promise.all([
    getDueVocabCardCount(),
    getUserStats(),
    getWeeklyActivity(),
    getTodayActivity(),
  ]);

  const goal = DEFAULT_DAILY_GOAL;
  const reviewedToday = todayActivity.cardsReviewed;
  const progressCount = Math.min(reviewedToday, goal);
  const progressPct = Math.round((progressCount / goal) * 100);
  const goalAchieved = reviewedToday >= goal;
  const remaining = Math.max(Math.min(goal - reviewedToday, dueCount), 0);
  const weeklyXpTotal = weeklyActivity.reduce((sum, d) => sum + d.xp, 0);
  const level = levelFromXp(userStats.total_xp);

  return (
    <div>
      <DashboardHeader email={user.email ?? ""} streak={userStats.current_streak} level={level} />
      <main className="mx-auto flex max-w-4xl flex-col gap-6 px-6 py-8">
        <div className="flex flex-col gap-5 sm:flex-row">
          <div className="flex flex-1 flex-col gap-3.5 rounded-2xl bg-gradient-to-br from-primary to-primary-dark p-[22px] text-white">
            <div className="text-[12.5px] font-medium opacity-85">今日の学習目標</div>
            <div className="flex items-baseline gap-2">
              <span className="font-heading text-4xl font-bold">{progressCount}</span>
              <span className="text-[15px] font-medium opacity-85">/ {goal}枚</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-white/25">
              <div className="h-full rounded-full bg-white" style={{ width: `${progressPct}%` }} />
            </div>
            {remaining > 0 ? (
              <Link
                href="/vocab"
                className="mt-1 h-[38px] w-fit rounded-[9px] bg-white px-4 text-[13px] font-bold leading-[38px] text-primary-dark no-underline"
              >
                残り{remaining}枚を復習する
              </Link>
            ) : goalAchieved ? (
              <p className="mt-1 text-[13px] font-medium opacity-85">
                今日の目標を達成しました 🎉
              </p>
            ) : (
              <p className="mt-1 text-[13px] font-medium opacity-85">
                本日復習できるカードがありません
              </p>
            )}
          </div>

          <WeeklyXpChart days={weeklyActivity} total={weeklyXpTotal} />
        </div>

        <div className="flex flex-col gap-3">
          <div className="text-sm font-bold text-ink">学習メニュー</div>
          <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-4">
            {MENU_ITEMS.map((item) => {
              const content = (
                <div
                  className={`flex flex-col gap-2.5 rounded-xl border border-border bg-page p-[18px] ${
                    item.active ? "" : "opacity-55"
                  }`}
                >
                  <div className={`h-[34px] w-[34px] rounded-[9px] ${item.active ? "bg-primary-soft" : "bg-border"}`} />
                  <div className="text-sm font-bold text-ink">{item.label}</div>
                  {item.active ? (
                    <div className="text-xs text-ink-muted">今日{dueCount}枚の復習</div>
                  ) : (
                    <div className="w-fit rounded-full bg-border px-2 py-0.5 text-[10.5px] font-bold text-ink-muted">
                      準備中
                    </div>
                  )}
                </div>
              );

              return item.active ? (
                <Link key={item.key} href={item.href} className="no-underline">
                  {content}
                </Link>
              ) : (
                <div key={item.key} aria-disabled className="cursor-not-allowed">
                  {content}
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
