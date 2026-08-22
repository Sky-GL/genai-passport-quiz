export default function AuthCard({ children }: { children: React.ReactNode }) {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-navy px-6 py-12">
      <div className="absolute inset-0 bg-aurora" />
      <div className="relative z-10 flex w-full max-w-[420px] flex-col gap-8">
        <div className="flex justify-center">
          <div className="flex h-[88px] w-[88px] items-center justify-center rounded-2xl bg-white/10 shadow-glow ring-1 ring-white/15 backdrop-blur-md">
            <span className="font-heading text-[28px] font-bold text-white">990</span>
          </div>
        </div>
        {children}
      </div>
    </main>
  );
}
