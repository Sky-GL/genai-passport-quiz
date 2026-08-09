import { Rating, type Grade } from "@/lib/fsrs";

// 採点(Again/Hard/Good/Easy)に応じた獲得XP
export const XP_BY_GRADE: Record<Grade, number> = {
  [Rating.Again]: 2,
  [Rating.Hard]: 5,
  [Rating.Good]: 8,
  [Rating.Easy]: 12,
};

const LEVEL_XP_STEP = 300;

export function levelFromXp(totalXp: number): number {
  return Math.floor(totalXp / LEVEL_XP_STEP) + 1;
}

const WEEKDAY_LABELS = ["日", "月", "火", "水", "木", "金", "土"];

// 直近7日分(6日前〜今日)の日付リストを古い順に返す
export function last7Days(today: Date = new Date()): { date: string; label: string }[] {
  const days: { date: string; label: string }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const date = d.toISOString().slice(0, 10);
    days.push({ date, label: WEEKDAY_LABELS[d.getDay()] });
  }
  return days;
}
