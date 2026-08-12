export default function AuthCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full max-w-[440px] overflow-hidden rounded-xl3 bg-surface shadow-hero">
      <div className="relative flex h-28 items-center justify-center overflow-hidden bg-gradient-to-br from-primary via-primary to-navy">
        <div className="absolute -left-8 -top-12 h-36 w-36 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -right-6 -bottom-10 h-32 w-32 rounded-full bg-accent/30 blur-2xl" />
        <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 shadow-glow backdrop-blur-sm">
          <span className="font-heading text-base font-bold text-white">990</span>
        </div>
      </div>
      <div className="flex flex-col gap-8 px-10 py-12">{children}</div>
    </div>
  );
}
