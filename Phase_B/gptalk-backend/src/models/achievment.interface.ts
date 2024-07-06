import { Schema, model, Document } from 'mongoose';

export interface Achievement extends Document {
  title: string;
  level: number;
  goal: number;
  icon: string;
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
});

export const AchievementModel = model<Achievement>('Achievement', achievementSchema);
