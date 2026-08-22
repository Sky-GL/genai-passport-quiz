"use client";

import { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import Link from "next/link";
import type { AuthFormState } from "@/app/login/actions";
import { signUp } from "@/app/signup/actions";

const initialState: AuthFormState = { error: null };

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="mt-2 h-[62px] rounded-[10px] bg-white text-[20px] font-bold text-primary-dark shadow-glow transition-all duration-300 ease-spring hover:scale-[0.98] active:scale-[0.96] disabled:opacity-50 disabled:hover:scale-100"
    >
      {pending ? "処理中..." : "登録する"}
    </button>
  );
}

export default function SignupCard() {
  const [email, setEmail] = useState("");
  const [state, formAction] = useFormState(signUp, initialState);

  if (!state.error && state !== initialState) {
    return (
      <div className="flex flex-col items-center gap-7 text-center">
        <div className="flex h-[84px] w-[84px] items-center justify-center rounded-full bg-success/20 ring-1 ring-success/40">
          <svg
            width="33"
            height="33"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-[oklch(0.8_0.14_145)]"
          >
            <path d="M4 12.5l5 5L20 6" />
          </svg>
        </div>
        <div className="flex flex-col gap-3">
          <h1 className="font-heading text-[27px] font-bold text-white">確認メールを送信しました</h1>
          <p className="max-w-[340px] text-[20px] leading-relaxed text-white/60">
            {email || "ご登録のメールアドレス"} 宛にメールを送りました。リンクをクリックして登録を完了してください。
          </p>
        </div>
        <Link href="/login" className="text-[19px] font-medium text-white no-underline">
          ログイン画面に戻る
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="font-heading text-[30px] font-bold text-white">TOEIC 990</h1>
        <p className="text-[19px] text-white/60">新規登録して学習を始めましょう。</p>
      </div>

      <form
        action={formAction}
        onSubmit={(e) => {
          const form = e.currentTarget;
          setEmail((form.elements.namedItem("email") as HTMLInputElement)?.value ?? "");
        }}
        className="flex flex-col gap-5"
      >
        <div className="flex flex-col gap-2">
          <label htmlFor="email" className="text-[15px] font-bold uppercase tracking-[0.1em] text-white/50">
            メールアドレス
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="h-[60px] rounded-[10px] border border-white/15 bg-white/10 px-4 text-[20px] text-white backdrop-blur-sm transition-all duration-200 placeholder:text-white/30 focus:border-white/40 focus:outline-none focus:ring-2 focus:ring-white/15"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="password" className="text-[15px] font-bold uppercase tracking-[0.1em] text-white/50">
            パスワード
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={6}
            className="h-[60px] rounded-[10px] border border-white/15 bg-white/10 px-4 text-[20px] text-white backdrop-blur-sm transition-all duration-200 placeholder:text-white/30 focus:border-white/40 focus:outline-none focus:ring-2 focus:ring-white/15"
          />
        </div>

        {state.error && (
          <div
            role="alert"
            className="flex flex-col gap-2 rounded-[10px] border border-danger/30 bg-danger/15 px-4 py-3"
          >
            <p className="text-[19px] font-medium leading-normal text-[oklch(0.85_0.1_25)]">
              {state.error}
            </p>
          </div>
        )}

        <SubmitButton />
      </form>

      <p className="text-center text-[19px] text-white/60">
        すでにアカウントをお持ちの方は{" "}
        <Link href="/login" className="font-bold text-white no-underline">
          ログイン
        </Link>
      </p>
    </>
  );
}
