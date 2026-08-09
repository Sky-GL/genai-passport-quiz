import Link from "next/link";
import AuthForm from "@/components/AuthForm";
import { signIn } from "./actions";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 px-4">
      <h1 className="text-2xl font-bold">ログイン</h1>
      <AuthForm action={signIn} submitLabel="ログイン" />
      <p className="text-sm text-slate-600">
        アカウントをお持ちでない方は{" "}
        <Link href="/signup" className="font-medium text-slate-900 underline">
          新規登録
        </Link>
      </p>
    </main>
  );
}
