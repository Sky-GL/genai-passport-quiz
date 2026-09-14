import Link from "next/link";
import type { LevelProgress, MasteryOverview, WeakWord } from "@/lib/supabase/mastery";
import {
  BUCKETS,
  BUCKET_HINT,
  BUCKET_LABEL,
  MASTERED_STABILITY_DAYS,
  percent,
  type MasteryBucket,
} from "@/lib/mastery";

// 積み上げバーの色。習熟が進むほど濃くなる並びにする
const BUCKET_BAR: Record<MasteryBucket, string> = {
  mastered: "bg-primary",
  settling: "bg-primary/55",
  learning: "bg-accent/60",
  unseen: "bg-border",
  excluded: "bg-border/50",
};

function StackedBar({ counts, total }: { counts: Record<MasteryBucket, number>; total: number }) {
  return (
    <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-border/40">
      {BUCKETS.map((bucket) =>
        counts[bucket] > 0 ? (
          <div
            key={bucket}
            className={BUCKET_BAR[bucket]}
            style={{ width: `${percent(counts[bucket], total)}%` }}
          />
        ) : null
      )}
    </div>
  );
}

function LevelRow({ entry }: { entry: LevelProgress }) {
  const done = entry.counts.mastered + entry.counts.settling;
  const label = entry.level > 0 ? "★".repeat(entry.level) : "未設定";
  const body = (
    <>
      <div className="flex items-baseline justify-between gap-3">
        <span className="min-w-0 truncate text-[21px] font-bold text-accent-text">{label}</span>
        <span className="shrink-0 whitespace-nowrap text-[19px] text-ink-muted">
          {done} / {entry.total}語
        </span>
      </div>
      <StackedBar counts={entry.counts} total={entry.total} />
    </>
  );

  // ★が付いている行は、その難易度だけの集中出題へ直接入れるようにする
  if (entry.level > 0) {
    return (
      <Link
        href={`/vocab/session?level=${entry.level}`}
        className="flex flex-col gap-2 rounded-[10px] p-1 no-underline transition-all duration-300 ease-spring hover:bg-primary-soft/60"
      >
        {body}
      </Link>
    );
  }

  return <div className="flex flex-col gap-2 p-1">{body}</div>;
}

type Props = {
  overview: MasteryOverview;
  weakWords: WeakWord[];
};

export default function MasteryReport({ overview, weakWords }: Props) {
  const { counts, total } = overview;
  // 「確実」だけだと初期は0のままで進捗が見えないため、定着中も合わせた到達率を主指標にする
  const reached = counts.mastered + counts.settling;
  const remaining = counts.unseen + counts.learning;

  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-5 px-4 py-6 sm:px-8 sm:py-10">
      <div className="flex items-center justify-between gap-3">
        <h1 className="min-w-0 truncate font-heading text-[28px] font-bold text-ink">到達度</h1>
        <Link
          href="/"
          className="shrink-0 whitespace-nowrap text-[19px] text-ink-muted no-underline transition-all duration-300 hover:text-ink"
        >
          トップへ
        </Link>
      </div>

      <section className="relative flex flex-col gap-4 overflow-hidden rounded-xl3 bg-gradient-to-br from-primary via-primary to-navy p-7 text-white shadow-hero">
        <div className="pointer-events-none absolute -right-12 -top-16 h-56 w-56 rounded-full bg-accent/25 blur-3xl" />

        <div className="relative text-[18px] font-bold uppercase tracking-[0.1em] opacity-80">
          手応えのある語
        </div>
        <div className="relative flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span className="font-heading text-7xl font-bold leading-none">{reached}</span>
          <span className="text-[26px] font-medium opacity-85">/ {total}語</span>
        </div>
        <div className="relative h-2.5 overflow-hidden rounded-full bg-white/20">
          <div
            className="h-full rounded-full bg-white transition-all duration-500 ease-spring"
            style={{ width: `${percent(reached, total)}%` }}
          />
        </div>
        <p className="relative text-[19px] leading-relaxed opacity-85">
          残り{remaining}語が未学習・学習中です。うち「確実」({MASTERED_STABILITY_DAYS}
          日あけても思い出せる見込み)は{counts.mastered}語。
        </p>
      </section>

      <section className="flex flex-col gap-4 rounded-xl2 bg-surface p-6 shadow-card">
        <h2 className="text-[18px] font-bold uppercase tracking-[0.1em] text-ink-faint">内訳</h2>
        {BUCKETS.map((bucket) => (
          <div key={bucket} className="flex flex-col gap-1">
            <div className="flex items-baseline justify-between gap-3">
              <span className="flex min-w-0 items-center gap-2.5">
                <span className={`h-3 w-3 shrink-0 rounded-full ${BUCKET_BAR[bucket]}`} />
                <span className="min-w-0 truncate text-[21px] font-bold text-ink">
                  {BUCKET_LABEL[bucket]}
                </span>
              </span>
              <span className="shrink-0 whitespace-nowrap text-[21px] font-bold text-ink">
                {counts[bucket]}語
              </span>
            </div>
            <p className="pl-[22px] text-[17px] leading-relaxed text-ink-muted">
              {BUCKET_HINT[bucket]}
            </p>
          </div>
        ))}
      </section>

      <section className="flex flex-col gap-5 rounded-xl2 bg-surface p-6 shadow-card">
        <div className="flex flex-col gap-1">
          <h2 className="text-[18px] font-bold uppercase tracking-[0.1em] text-ink-faint">
            難易度別の到達度
          </h2>
          <p className="text-[17px] leading-relaxed text-ink-muted">
            ★5が990レベル。満点を狙うならここを残さないことが目標になります。行をタップすると、その難易度だけを集中して出題します。
          </p>
        </div>
        {overview.byLevel.map((entry) => (
          <LevelRow key={entry.level} entry={entry} />
        ))}
      </section>

      <section className="flex flex-col gap-4 rounded-xl2 bg-surface p-6 shadow-card">
        <h2 className="text-[18px] font-bold uppercase tracking-[0.1em] text-ink-faint">
          間違えた語
        </h2>
        {weakWords.length === 0 ? (
          <p className="text-[20px] leading-relaxed text-ink-muted">
            まだ間違えた語はありません。出題を重ねるとここに並びます。
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {weakWords.map((word) => (
              <div
                key={word.cardId}
                className="flex flex-col gap-1 border-b border-border/40 pb-3 last:border-0 last:pb-0"
              >
                <div className="flex items-baseline justify-between gap-3">
                  <span className="min-w-0 break-words font-heading text-[24px] font-bold text-ink">
                    {word.front}
                  </span>
                  <span className="shrink-0 whitespace-nowrap rounded-md bg-danger-soft px-2.5 py-1 text-[17px] font-bold text-danger-text">
                    {word.wrong} / {word.total}問 誤答
                  </span>
                </div>
                <span className="break-words text-[19px] text-ink-muted">{word.meaning}</span>
              </div>
            ))}
          </div>
        )}
      </section>

      <Link
        href="/vocab/session"
        className="flex h-[62px] items-center justify-center rounded-[10px] bg-primary text-[22px] font-bold text-white no-underline transition-all duration-300 ease-spring hover:scale-[0.99] hover:bg-primary-dark"
      >
        学習を続ける
      </Link>
    </main>
  );
}
