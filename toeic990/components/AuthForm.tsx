"use client";

import { useFormState, useFormStatus } from "react-dom";
import type { AuthFormState } from "@/app/login/actions";

type Props = {
  action: (state: AuthFormState, formData: FormData) => Promise<AuthFormState>;
  submitLabel: string;
};

const initialState: AuthFormState = { error: null };

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="mt-1 h-[46px] rounded-[10px] bg-primary font-bold text-sm text-white transition hover:bg-primary-dark disabled:opacity-50"
    >
      {pending ? "処理中..." : label}
    </button>
  );
}

export default function AuthForm({ action, submitLabel }: Props) {
  const [state, formAction] = useFormState(action, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-3.5">
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

      <SubmitButton label={submitLabel} />
    </form>
  );
}
