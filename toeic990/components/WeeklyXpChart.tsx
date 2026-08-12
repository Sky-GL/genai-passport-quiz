import type { WeeklyActivityDay } from "@/types/gamification";

type Props = {
  days: WeeklyActivityDay[];
  total: number;
};

export default function WeeklyXpChart({ days, total }: Props) {
  const max = Math.max(...days.map((d) => d.xp), 1);
  const todayIndex = days.length - 1;

  return (
    <div className="flex w-full flex-col gap-3 rounded-2xl bg-surface p-6 shadow-flat sm:w-[230px]">
      <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-ink-faint">週間XP</div>
      <div className="font-heading text-3xl font-bold text-ink">{total.toLocaleString()}</div>
      <div className="mt-1.5 flex h-11 items-end gap-1.5">
        {days.map((day, i) => (
          <div
            key={day.date}
            title={`${day.label}: ${day.xp}XP`}
            className={`flex-1 rounded-[3px] transition-all duration-500 ease-spring ${
              i === todayIndex ? "bg-primary" : "bg-primary-soft"
            }`}
            style={{ height: `${Math.max((day.xp / max) * 100, 6)}%` }}
          />
        ))}
      </div>
    </div>
  );
}
