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
      className="mt-1 h-[46px] rounded-[10px] bg-primary font-bold text-sm text-white transition hover:bg-primary-dark disabled:opacity-50"
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
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-success-soft">
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-success-text"
          >
            <path d="M4 12.5l5 5L20 6" />
          </svg>
        </div>
        <div className="flex flex-col gap-2">
          <h1 className="font-heading text-lg font-bold text-ink">確認メールを送信しました</h1>
          <p className="max-w-[280px] text-[13.5px] leading-relaxed text-ink-muted">
            {email || "ご登録のメールアドレス"} 宛にメールを送りました。リンクをクリックして登録を完了してください。
          </p>
        </div>
        <Link href="/login" className="text-[13px] font-medium text-primary no-underline">
          ログイン画面に戻る
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col items-center gap-1.5 text-center">
        <div className="h-10 w-10 rounded-[11px] bg-primary" />
        <h1 className="mt-1.5 font-heading text-xl font-bold text-ink">TOEIC 990</h1>
        <p className="text-[13px] text-ink-muted">新規登録して学習を始めましょう。</p>
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
          <label htmlFor="email" className="text-xs font-medium text-ink-muted">
            メールアドレス
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="h-11 rounded-[10px] border border-border bg-page px-3.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-primary-soft"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="password" className="text-xs font-medium text-ink-muted">
            パスワード
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={6}
            className="h-11 rounded-[10px] border border-border bg-page px-3.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-primary-soft"
          />
        </div>

        {state.error && (
          <div
            role="alert"
            className="flex flex-col gap-2 rounded-[10px] border border-border-strong bg-danger-soft px-3.5 py-2.5"
          >
            <p className="text-[12.5px] font-medium leading-normal text-danger-text">
              {state.error}
            </p>
          </div>
        )}

        <SubmitButton />
      </form>

      <p className="text-center text-[13px] text-ink-muted">
        すでにアカウントをお持ちの方は{" "}
        <Link href="/login" className="font-bold text-primary no-underline">
          ログイン
        </Link>
      </p>
    </>
  );
}
