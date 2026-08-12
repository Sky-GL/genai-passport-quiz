export default function AuthCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full max-w-[420px] overflow-hidden rounded-2xl bg-surface shadow-card">
      <div className="flex items-center gap-1.5 bg-[oklch(0.97_0.006_265)] px-4 py-2.5">
        <span className="h-2 w-2 rounded-full bg-[oklch(0.88_0.006_265)]" />
        <span className="h-2 w-2 rounded-full bg-[oklch(0.88_0.006_265)]" />
        <span className="h-2 w-2 rounded-full bg-[oklch(0.88_0.006_265)]" />
      </div>
      <div className="flex flex-col gap-8 px-11 py-14">{children}</div>
    </div>
  );
}
