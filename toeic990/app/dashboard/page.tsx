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
  { key: "mock-test", label: "模試", href: "/mock-test", active: true },
  { key: "listening", label: "リスニング", href: "/listening", active: false },
  { key: "analytics", label: "弱点分析", href: "/analytics", active: false },
] as const;

const MENU_ICON_PATHS: Record<(typeof MENU_ITEMS)[number]["key"], string> = {
  vocab: "M4 5.5C4 4.67 4.67 4 5.5 4H12v16H5.5A1.5 1.5 0 0 1 4 18.5v-13ZM20 5.5C20 4.67 19.33 4 18.5 4H12v16h6.5a1.5 1.5 0 0 0 1.5-1.5v-13Z",
  "mock-test": "M6 3.5h9l3 3v14H6v-17ZM15 3.5V7h3.5M9 12h6M9 15.5h6M9 8.5h2.5",
  listening: "M4 13a8 8 0 0 1 16 0v5a2 2 0 0 1-2 2h-1v-6h3M4 13v6h1a2 2 0 0 0 2-2v-4a2 2 0 0 0-2-2H4Z",
  analytics: "M5 20V10M12 20V4M19 20v-7",
};

function MenuIcon({ menuKey, active }: { menuKey: (typeof MENU_ITEMS)[number]["key"]; active: boolean }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={active ? "text-primary" : "text-ink-faint"}
    >
      <path d={MENU_ICON_PATHS[menuKey]} />
    </svg>
  );
}

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
      <main className="mx-auto flex max-w-4xl flex-col gap-9 px-8 py-12">
        <div className="flex flex-col gap-5 sm:flex-row">
          <div className="relative flex flex-1 flex-col gap-4 overflow-hidden rounded-xl3 bg-gradient-to-br from-primary via-primary to-navy p-7 text-white shadow-hero">
            <div className="pointer-events-none absolute -right-12 -top-16 h-56 w-56 rounded-full bg-accent/25 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-16 -left-10 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
            <div className="relative text-[12px] font-bold uppercase tracking-[0.14em] opacity-80">
              今日の学習目標
            </div>
            <div className="relative flex items-baseline gap-2">
              <span className="font-heading text-5xl font-bold">{progressCount}</span>
              <span className="text-[17px] font-medium opacity-85">/ {goal}枚</span>
            </div>
            <div className="relative h-1.5 overflow-hidden rounded-full bg-white/20">
              <div
                className="h-full rounded-full bg-white transition-all duration-500 ease-spring"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            {remaining > 0 ? (
              <Link
                href="/vocab"
                className="relative mt-1 h-[42px] w-fit rounded-[9px] bg-white px-4 text-[15px] font-bold leading-[42px] text-primary-dark no-underline transition-all duration-300 ease-spring hover:scale-[0.98]"
              >
                残り{remaining}枚を復習する
              </Link>
            ) : goalAchieved ? (
              <p className="relative mt-1 text-[15px] font-medium opacity-85">
                今日の目標を達成しました 🎉
              </p>
            ) : (
              <p className="relative mt-1 text-[15px] font-medium opacity-85">
                本日復習できるカードがありません
              </p>
            )}
          </div>

          <WeeklyXpChart days={weeklyActivity} total={weeklyXpTotal} />
        </div>

        <div className="flex flex-col gap-4">
          <div className="text-[12px] font-bold uppercase tracking-[0.14em] text-ink-faint">
            学習メニュー
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {MENU_ITEMS.map((item) => {
              const content = (
                <div
                  className={`flex flex-col gap-2.5 rounded-xl2 bg-surface p-5 transition-all duration-300 ease-spring ${
                    item.active
                      ? "shadow-flat hover:-translate-y-1 hover:shadow-hover"
                      : "opacity-50"
                  }`}
                >
                  <div
                    className={`flex h-[38px] w-[38px] items-center justify-center rounded-[10px] ${
                      item.active ? "bg-primary-soft" : "bg-border/60"
                    }`}
                  >
                    <MenuIcon menuKey={item.key} active={item.active} />
                  </div>
                  <div className="text-base font-bold text-ink">{item.label}</div>
                  {item.active ? (
                    <div className="text-[13.5px] text-ink-muted">
                      {item.key === "vocab" ? `今日${dueCount}枚の復習` : "Part5・6演習"}
                    </div>
                  ) : (
                    <div className="w-fit rounded-full bg-border/60 px-2 py-0.5 text-[12px] font-bold text-ink-muted">
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
