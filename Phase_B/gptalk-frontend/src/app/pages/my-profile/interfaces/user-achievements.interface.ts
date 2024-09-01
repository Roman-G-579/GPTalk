
export interface UserAchievement {
  _id?: string,
  title: string;
  level: number;
  goal: number;
  icon: string;
  type: 'streak' | 'exp' | 'mistakes' | 'challenges' | 'languages';
  progress: number;
}
