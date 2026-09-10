// back列は「意味　例: 英文」の形式で保存されている
export function splitBack(back: string): { meaning: string; example: string } {
  const [meaning, ...rest] = back.split("　例:");
  return { meaning: meaning.trim(), example: rest.join("　例:").trim() };
}

// 不正解時に出す1行解説。例文があれば例文、なければコロケーション/語源で補う
export function buildExplanation(card: {
  back: string;
  collocation: string | null;
  etymology: string | null;
}): string {
  const { example } = splitBack(card.back);
  if (example) return example;
  if (card.collocation) return `よく使う形: ${card.collocation}`;
  if (card.etymology) return card.etymology;
  return "";
}
