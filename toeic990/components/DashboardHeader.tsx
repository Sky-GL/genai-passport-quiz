import { signOut } from "@/app/login/actions";

type Props = {
  email: string;
  streak: number;
  level: number;
};

export default function DashboardHeader({ email, streak, level }: Props) {
  return (
    <header className="flex items-center justify-between bg-navy px-8 py-5">
      <div className="flex items-center gap-5">
        <span className="font-heading text-[17px] font-bold text-white">TOEIC 990</span>
        {streak > 0 && (
          <div className="flex items-center gap-1.5 rounded-full bg-accent-soft/15 px-3 py-1.5">
            <span className="h-2 w-2 rounded-full bg-accent" />
            <span className="font-heading text-[12.5px] font-bold text-[oklch(0.85_0.06_35)]">
              {streak}日連続
            </span>
          </div>
        )}
        <div className="rounded-full bg-primary-soft/15 px-3 py-1.5">
          <span className="font-heading text-[12.5px] font-bold text-[oklch(0.8_0.05_265)]">
            Lv.{level}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-[13px] text-[oklch(0.75_0.01_265)]">{email}</span>
        <form action={signOut}>
          <button
            type="submit"
            className="h-[34px] rounded-lg px-3.5 text-[12.5px] font-medium text-[oklch(0.85_0.01_265)] transition-all duration-300 ease-spring hover:scale-[0.98] hover:bg-white/8"
          >
            ログアウト
          </button>
        </form>
      </div>
    </header>
  );
}
