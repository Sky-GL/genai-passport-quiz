import { createSupabaseServerClient } from "@/lib/supabase/server";
import { last7Days } from "@/lib/gamification";
import type { UserStatsRow, WeeklyActivityDay } from "@/types/gamification";

const EMPTY_STATS: UserStatsRow = {
  user_id: "",
  total_xp: 0,
  current_streak: 0,
  longest_streak: 0,
  last_study_date: null,
  updated_at: new Date().toISOString(),
};

export async function getUserStats(): Promise<UserStatsRow> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("user_stats")
    .select("*")
    .maybeSingle();

  if (error) throw error;
  return data ?? EMPTY_STATS;
}

export async function getWeeklyActivity(): Promise<WeeklyActivityDay[]> {
  const supabase = await createSupabaseServerClient();
  const days = last7Days();
  const from = days[0].date;

  const { data, error } = await supabase
    .from("daily_activity")
    .select("activity_date, xp_earned")
    .gte("activity_date", from);

  if (error) throw error;

  const xpByDate = new Map((data ?? []).map((row) => [row.activity_date, row.xp_earned]));
  return days.map((day) => ({
    date: day.date,
    label: day.label,
    xp: xpByDate.get(day.date) ?? 0,
  }));
}

export async function getTodayActivity(): Promise<{ xp: number; cardsReviewed: number }> {
  const supabase = await createSupabaseServerClient();
  const today = new Date().toISOString().slice(0, 10);

  const { data, error } = await supabase
    .from("daily_activity")
    .select("xp_earned, cards_reviewed")
    .eq("activity_date", today)
    .maybeSingle();

  if (error) throw error;
  return { xp: data?.xp_earned ?? 0, cardsReviewed: data?.cards_reviewed ?? 0 };
}

export async function recordStudyActivity(xp: number) {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.rpc("record_study_activity", { p_xp: xp });
  if (error) throw error;
}
