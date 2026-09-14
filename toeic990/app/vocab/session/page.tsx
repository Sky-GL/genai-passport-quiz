import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { startOrResumeSession } from "@/lib/supabase/session";
import QuizSession from "@/components/QuizSession";
import { SESSION_SIZE } from "@/types/session";

// ?level=1〜5 で難易度を絞った集中出題にする。範囲外・数値以外は通常出題として扱う
function parseLevel(raw: string | string[] | undefined): number | undefined {
  const value = Number(Array.isArray(raw) ? raw[0] : raw);
  return Number.isInteger(value) && value >= 1 && value <= 5 ? value : undefined;
}

export default async function VocabSessionPage({
  searchParams,
}: {
  searchParams: { level?: string | string[] };
}) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const focusLevel = parseLevel(searchParams.level);

  // 中間画面を挟まず、このページのレンダリング時点で1問目まで用意する
  const { sessionId, answeredCount, questions } = await startOrResumeSession(user.id, focusLevel);

  // 対象が10問に満たない場合は、実際に出せる数を総数として表示する
  const total = Math.min(SESSION_SIZE, answeredCount + questions.length);

  return (
    <main className="mx-auto flex max-w-3xl flex-col items-center gap-4 px-4 py-6 sm:px-8 sm:py-10">
      {focusLevel && questions.length > 0 && (
        <div className="flex w-full max-w-[460px] items-center gap-2.5">
          <span className="shrink-0 whitespace-nowrap rounded-md bg-accent-soft px-2.5 py-1 text-[18px] font-bold text-accent-text">
            {"★".repeat(focusLevel)} 集中
          </span>
          <span className="min-w-0 truncate text-[18px] text-ink-muted">
            {focusLevel === 5 ? "990レベルの語だけを出題中" : "この難易度の語だけを出題中"}
          </span>
        </div>
      )}

      {questions.length === 0 ? (
        <div className="flex w-full max-w-[460px] flex-col items-center gap-5 py-16 text-center">
          <p className="text-[24px] leading-relaxed text-ink-muted">
            {focusLevel
              ? `${"★".repeat(focusLevel)}で出題できる語がありません。すべて定着済みです。`
              : "本日復習予定のカードはありません。"}
          </p>
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
          total={total}
        />
      )}
    </main>
  );
}
