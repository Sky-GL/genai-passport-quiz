// Supabaseへの通信が一瞬詰まっただけで画面が落ちるのを防ぐため、
// 回答送信のような「失敗すると学習が中断する」読み取りは数回リトライする。
// 本番で POST /vocab/session と POST /mock-test が単発で500になった事象への対策。
const MAX_ATTEMPTS = 3;
const BASE_DELAY_MS = 150;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function withRetry<T>(fn: () => Promise<T>, attempts = MAX_ATTEMPTS): Promise<T> {
  let lastError: unknown;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (i < attempts - 1) await sleep(BASE_DELAY_MS * 2 ** i);
    }
  }
  throw lastError;
}
