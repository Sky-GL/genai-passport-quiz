export default function AuthCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full max-w-[420px] overflow-hidden rounded-2xl border border-border bg-surface shadow-card">
      <div className="flex items-center gap-1.5 border-b border-border bg-[oklch(0.96_0.008_265)] px-3.5 py-2">
        <span className="h-2 w-2 rounded-full bg-border" />
        <span className="h-2 w-2 rounded-full bg-border" />
        <span className="h-2 w-2 rounded-full bg-border" />
      </div>
      <div className="flex flex-col gap-7 px-10 py-12">{children}</div>
    </div>
  );
}
