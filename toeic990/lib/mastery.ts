// ts-fsrsのState: 0=New, 1=Learning, 2=Review, 3=Relearning。
// 安定度(記憶保持日数の目安)がこの日数を超えたReview状態のカードは
// 十分習熟したとみなし、以後の復習対象から外す。
// 到達度画面と出題クエリで基準がずれないよう、ここを唯一の定義とする。
export const MASTERED_STATE = 2;
export const MASTERED_STABILITY_DAYS = 30;

export const BUCKETS = ["mastered", "settling", "learning", "unseen", "excluded"] as const;
export type MasteryBucket = (typeof BUCKETS)[number];

export const BUCKET_LABEL: Record<MasteryBucket, string> = {
  mastered: "確実",
  settling: "定着中",
  learning: "学習中",
  unseen: "未学習",
  excluded: "除外",
};

export const BUCKET_HINT: Record<MasteryBucket, string> = {
  mastered: "30日以上あけても思い出せる見込み。復習対象から外れる",
  settling: "正解が続いている段階。間隔を広げながら確認中",
  learning: "まだ間隔が短い。数日以内に再出題される",
  unseen: "一度も出題されていない",
  excluded: "「簡単」と判定して出題対象から外した語",
};

type CardLike = {
  state: number;
  stability: number;
  reps: number;
  excluded: boolean;
};

export function bucketOf(card: CardLike): MasteryBucket {
  if (card.excluded) return "excluded";
  if (card.reps === 0) return "unseen";
  if (card.state === MASTERED_STATE) {
    return card.stability >= MASTERED_STABILITY_DAYS ? "mastered" : "settling";
  }
  return "learning";
}

export function emptyCounts(): Record<MasteryBucket, number> {
  return { mastered: 0, settling: 0, learning: 0, unseen: 0, excluded: 0 };
}

export function percent(part: number, whole: number): number {
  if (whole <= 0) return 0;
  return Math.round((part / whole) * 100);
}
