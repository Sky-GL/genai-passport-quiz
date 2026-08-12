import { signOut } from "@/app/login/actions";

type Props = {
  email: string;
  streak: number;
  level: number;
};

export default function DashboardHeader({ email, streak, level }: Props) {
  return (
    <header className="relative overflow-hidden bg-gradient-to-r from-navy via-navy to-primary-dark px-8 py-6">
      <div className="pointer-events-none absolute -right-10 -top-16 h-48 w-48 rounded-full bg-accent/20 blur-3xl" />
      <div className="relative flex items-center justify-between">
        <div className="flex items-center gap-5">
          <span className="font-heading text-[19px] font-bold tracking-tight text-white">
            TOEIC 990
          </span>
          {streak > 0 && (
            <div className="flex items-center gap-1.5 rounded-full bg-accent/15 px-3.5 py-1.5 shadow-glow">
              <span className="h-2 w-2 rounded-full bg-accent" />
              <span className="font-heading text-[12.5px] font-bold text-[oklch(0.85_0.06_35)]">
                {streak}日連続
              </span>
            </div>
          )}
          <div className="rounded-full border border-white/10 bg-white/10 px-3.5 py-1.5 backdrop-blur-sm">
            <span className="font-heading text-[12.5px] font-bold text-[oklch(0.85_0.05_265)]">
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
      </div>
    </header>
  );
}
