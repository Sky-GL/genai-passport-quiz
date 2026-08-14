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
      className="mt-2 h-[46px] rounded-[10px] bg-white font-bold text-sm text-primary-dark shadow-glow transition-all duration-300 ease-spring hover:scale-[0.98] active:scale-[0.96] disabled:opacity-50 disabled:hover:scale-100"
    >
      {pending ? "処理中..." : label}
    </button>
  );
}

export default function AuthForm({ action, submitLabel }: Props) {
  const [state, formAction] = useFormState(action, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
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
      <div className="flex flex-col gap-2">
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

      <SubmitButton label={submitLabel} />
    </form>
  );
}
