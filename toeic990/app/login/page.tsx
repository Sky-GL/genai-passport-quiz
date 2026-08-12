import Link from "next/link";
import AuthCard from "@/components/AuthCard";
import AuthForm from "@/components/AuthForm";
import { signIn } from "./actions";

export default function LoginPage() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center gap-6 overflow-hidden bg-navy px-4 py-10">
      <div className="absolute inset-0 bg-aurora" />
      <div className="relative z-10">
        <AuthCard>
          <div className="flex flex-col items-center gap-1.5 text-center">
            <h1 className="font-heading text-xl font-bold text-ink">TOEIC 990</h1>
            <p className="text-[13px] text-ink-muted">おかえりなさい。今日も一歩前進。</p>
          </div>

          <AuthForm action={signIn} submitLabel="ログイン" />

          <p className="text-center text-[13px] text-ink-muted">
            アカウントをお持ちでないですか？{" "}
            <Link href="/signup" className="font-bold text-primary no-underline">
              新規登録
            </Link>
          </p>
        </AuthCard>
      </div>
    </main>
  );
}
