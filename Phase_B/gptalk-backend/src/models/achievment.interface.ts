import { Schema, model } from 'mongoose';

export interface Achievement {
  _id?: Schema.Types.ObjectId,
  title: string;
  level: number;
  goal: number;
  icon: string;
  type: 'streak' | 'exp' | 'mistakes' | 'lessons' | 'languages';
}

const achievementSchema = new Schema<Achievement>({
  title: {
    type: String,
    required: true,
  },
  level: {
    type: Number,
    required: true,
  },
  goal: {
    type: Number,
    required: true,
  },
  icon: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
});

export const AchievementModel = model<Achievement>('Achievement', achievementSchema);
