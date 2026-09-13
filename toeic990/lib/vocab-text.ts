// back列は「意味　例: 英文」の形式で保存されている
export function splitBack(back: string): { meaning: string; example: string } {
  const [meaning, ...rest] = back.split("　例:");
  return { meaning: meaning.trim(), example: rest.join("　例:").trim() };
}
