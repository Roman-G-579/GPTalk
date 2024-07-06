import { Schema, model, Document } from 'mongoose';

export interface UserAchievement {
	achievement: Schema.Types.ObjectId;
	progress: number;
}

export const userAchievementSchema = new Schema<UserAchievement>({
	achievement: {
		type: Schema.Types.ObjectId,
		ref: 'Achievement',
		required: true,
	},
	progress: {
		type: Number,
		required: true,
		default: 0,
	},
});

export const UserAchievementModel = model<UserAchievement>('UserAchievement', userAchievementSchema);
