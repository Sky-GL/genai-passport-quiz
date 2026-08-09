import { signOut } from "@/app/login/actions";

type Props = {
  email: string;
};

export default function DashboardHeader({ email }: Props) {
  return (
    <header className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
      <span className="text-sm text-slate-600">{email}</span>
      <form action={signOut}>
        <button
          type="submit"
          className="text-sm font-medium text-slate-900 underline"
        >
          ログアウト
        </button>
      </form>
    </header>
  );
}
