export type UserStatsRow = {
  user_id: string;
  total_xp: number;
  current_streak: number;
  longest_streak: number;
  last_study_date: string | null;
  updated_at: string;
};

export type DailyActivityRow = {
  user_id: string;
  activity_date: string;
  xp_earned: number;
  cards_reviewed: number;
};

export type WeeklyActivityDay = {
  date: string;
  label: string;
  xp: number;
};
