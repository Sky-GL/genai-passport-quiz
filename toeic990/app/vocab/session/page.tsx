import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { startOrResumeSession } from "@/lib/supabase/session";
import QuizSession from "@/components/QuizSession";
import { SESSION_SIZE } from "@/types/session";

export default async function VocabSessionPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // 中間画面を挟まず、このページのレンダリング時点で1問目まで用意する
  const { sessionId, answeredCount, questions } = await startOrResumeSession(user.id);

  return (
    <main className="mx-auto flex max-w-3xl flex-col items-center gap-4 px-4 py-6 sm:px-8 sm:py-10">
      {questions.length === 0 ? (
        <div className="flex w-full max-w-[460px] flex-col items-center gap-5 py-16 text-center">
          <p className="text-[24px] text-ink-muted">本日復習予定のカードはありません。</p>
          <Link
            href="/"
            className="h-[50px] rounded-[10px] bg-primary px-6 text-[20px] font-bold leading-[50px] text-white no-underline transition-all duration-300 ease-spring hover:scale-[0.98]"
          >
            トップに戻る
          </Link>
        </div>
      ) : (
        <QuizSession
          sessionId={sessionId}
          questions={questions}
          answeredCount={answeredCount}
          total={SESSION_SIZE}
        />
      )}
    </main>
  );
}
