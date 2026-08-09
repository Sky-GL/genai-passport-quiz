"use client";

import { useFormState, useFormStatus } from "react-dom";
import type { AuthFormState } from "@/app/login/actions";

type Props = {
  action: (state: AuthFormState, formData: FormData) => Promise<AuthFormState>;
  submitLabel: string;
  successMessage?: string;
};

const initialState: AuthFormState = { error: null };

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
    >
      {pending ? "処理中..." : label}
    </button>
  );
}

export default function AuthForm({ action, submitLabel, successMessage }: Props) {
  const [state, formAction] = useFormState(action, initialState);

  return (
    <form action={formAction} className="flex w-full max-w-sm flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label htmlFor="email" className="text-sm font-medium text-slate-700">
          メールアドレス
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="password" className="text-sm font-medium text-slate-700">
          パスワード
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={6}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
        />
      </div>

      {state.error && (
        <p className="text-sm text-red-600" role="alert">
          {state.error}
        </p>
      )}
      {!state.error && successMessage && state !== initialState && (
        <p className="text-sm text-emerald-600">{successMessage}</p>
      )}

      <SubmitButton label={submitLabel} />
    </form>
  );
}
