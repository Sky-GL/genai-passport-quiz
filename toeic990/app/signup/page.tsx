import Link from "next/link";
import AuthForm from "@/components/AuthForm";
import { signUp } from "./actions";

export default function SignupPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 px-4">
      <h1 className="text-2xl font-bold">新規登録</h1>
      <AuthForm
        action={signUp}
        submitLabel="登録する"
        successMessage="確認メールを送信しました。メール内のリンクから登録を完了してください。"
      />
      <p className="text-sm text-slate-600">
        すでにアカウントをお持ちの方は{" "}
        <Link href="/login" className="font-medium text-slate-900 underline">
          ログイン
        </Link>
      </p>
    </main>
  );
}
