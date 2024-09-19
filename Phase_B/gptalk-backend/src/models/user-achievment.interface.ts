import { Schema, model } from 'mongoose';
import { Achievement } from './achievment.interface';

export interface UserAchievement extends Achievement {
	progress: number;
}

export const userAchievementSchema = new Schema<UserAchievement>({
	progress: {
		type: Number,
		default: 0,
	},
});

export const UserAchievementModel = model<UserAchievement>(
	'UserAchievement',
	userAchievementSchema,
);
