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
      className="mt-2 h-[62px] rounded-[10px] bg-white text-[20px] font-bold text-primary-dark shadow-glow transition-all duration-300 ease-spring hover:scale-[0.98] active:scale-[0.96] disabled:opacity-50 disabled:hover:scale-100"
    >
      {pending ? "処理中..." : label}
    </button>
  );
}

export default function AuthForm({ action, submitLabel }: Props) {
  const [state, formAction] = useFormState(action, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-5">
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

      <SubmitButton label={submitLabel} />
    </form>
  );
}
