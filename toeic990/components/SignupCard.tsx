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
      className="mt-2 h-[46px] rounded-[10px] bg-white font-bold text-sm text-primary-dark shadow-glow transition-all duration-300 ease-spring hover:scale-[0.98] active:scale-[0.96] disabled:opacity-50 disabled:hover:scale-100"
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
      <div className="flex flex-col items-center gap-6 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-success/20 ring-1 ring-success/40">
          <svg
            width="22"
            height="22"
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
        <div className="flex flex-col gap-2">
          <h1 className="font-heading text-lg font-bold text-white">確認メールを送信しました</h1>
          <p className="max-w-[280px] text-[13.5px] leading-relaxed text-white/60">
            {email || "ご登録のメールアドレス"} 宛にメールを送りました。リンクをクリックして登録を完了してください。
          </p>
        </div>
        <Link href="/login" className="text-[13px] font-medium text-white no-underline">
          ログイン画面に戻る
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col items-center gap-1.5 text-center">
        <h1 className="font-heading text-2xl font-bold text-white">TOEIC 990</h1>
        <p className="text-[13px] text-white/60">新規登録して学習を始めましょう。</p>
      </div>

      <form
        action={formAction}
        onSubmit={(e) => {
          const form = e.currentTarget;
          setEmail((form.elements.namedItem("email") as HTMLInputElement)?.value ?? "");
        }}
        className="flex flex-col gap-3.5"
      >
        <div className="flex flex-col gap-1.5">
          <label htmlFor="email" className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/50">
            メールアドレス
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="h-11 rounded-[10px] border border-white/15 bg-white/10 px-3.5 text-sm text-white backdrop-blur-sm transition-all duration-200 placeholder:text-white/30 focus:border-white/40 focus:outline-none focus:ring-2 focus:ring-white/15"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="password" className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/50">
            パスワード
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={6}
            className="h-11 rounded-[10px] border border-white/15 bg-white/10 px-3.5 text-sm text-white backdrop-blur-sm transition-all duration-200 placeholder:text-white/30 focus:border-white/40 focus:outline-none focus:ring-2 focus:ring-white/15"
          />
        </div>

        {state.error && (
          <div
            role="alert"
            className="flex flex-col gap-2 rounded-[10px] border border-danger/30 bg-danger/15 px-3.5 py-2.5"
          >
            <p className="text-[12.5px] font-medium leading-normal text-[oklch(0.85_0.1_25)]">
              {state.error}
            </p>
          </div>
        )}

        <SubmitButton />
      </form>

      <p className="text-center text-[13px] text-white/60">
        すでにアカウントをお持ちの方は{" "}
        <Link href="/login" className="font-bold text-white no-underline">
          ログイン
        </Link>
      </p>
    </>
  );
}
