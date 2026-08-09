import { fsrs, createEmptyCard, Rating, State, type Card, type Grade } from "ts-fsrs";

const scheduler = fsrs();

export { Rating, State };
export type { Card, Grade };

export function newCard(now: Date = new Date()): Card {
  return createEmptyCard(now);
}

export function gradeCard(card: Card, grade: Grade, now: Date = new Date()): Card {
  return scheduler.next(card, now, grade).card;
}
