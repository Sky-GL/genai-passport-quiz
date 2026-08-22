import Link from "next/link";
import AuthCard from "@/components/AuthCard";
import AuthForm from "@/components/AuthForm";
import { signIn } from "./actions";

export default function LoginPage() {
  return (
    <AuthCard>
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="font-heading text-[30px] font-bold text-white">TOEIC 990</h1>
        <p className="text-[19px] text-white/60">おかえりなさい。今日も一歩前進。</p>
      </div>

      <AuthForm action={signIn} submitLabel="ログイン" />

      <p className="text-center text-[19px] text-white/60">
        アカウントをお持ちでないですか？{" "}
        <Link href="/signup" className="font-bold text-white no-underline">
          新規登録
        </Link>
      </p>
    </AuthCard>
  );
}
