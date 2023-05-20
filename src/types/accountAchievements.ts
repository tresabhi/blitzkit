export interface AccountAchievements {
  [id: number]: {
    achievements: {
      [achievement: string]: number;
    };
    max_series: {
      [achievement: string]: number;
    };
  };
}
