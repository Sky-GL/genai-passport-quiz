import { signOut } from "@/app/login/actions";

type Props = {
  email: string;
  streak: number;
  level: number;
};

export default function DashboardHeader({ email, streak, level }: Props) {
  return (
    <header className="relative overflow-hidden bg-gradient-to-r from-navy via-navy to-primary-dark px-5 py-4 sm:px-8 sm:py-6">
      <div className="pointer-events-none absolute -right-10 -top-16 h-48 w-48 rounded-full bg-accent/20 blur-3xl" />
      <div className="relative flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 overflow-x-auto sm:gap-5">
          <span className="shrink-0 font-heading text-[16px] font-bold tracking-tight text-white sm:text-[19px]">
            TOEIC 990
          </span>
          {streak > 0 && (
            <div className="flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full bg-accent/15 px-3 py-1.5 shadow-glow sm:px-3.5">
              <span className="h-2 w-2 shrink-0 rounded-full bg-accent" />
              <span className="font-heading text-[12px] font-bold text-[oklch(0.85_0.06_35)] sm:text-[12.5px]">
                {streak}日連続
              </span>
            </div>
          )}
          <div className="shrink-0 whitespace-nowrap rounded-full border border-white/10 bg-white/10 px-3 py-1.5 backdrop-blur-sm sm:px-3.5">
            <span className="font-heading text-[12px] font-bold text-[oklch(0.85_0.05_265)] sm:text-[12.5px]">
              Lv.{level}
            </span>
          </div>
        </div>
        <div className="flex items-center justify-between gap-3 sm:justify-end sm:gap-4">
          <span className="min-w-0 truncate text-[12px] text-[oklch(0.75_0.01_265)] sm:text-[13px]">
            {email}
          </span>
          <form action={signOut} className="shrink-0">
            <button
              type="submit"
              className="h-[34px] shrink-0 rounded-lg px-3.5 text-[12.5px] font-medium text-[oklch(0.85_0.01_265)] transition-all duration-300 ease-spring hover:scale-[0.98] hover:bg-white/8"
            >
              ログアウト
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
