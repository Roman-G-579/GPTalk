import { Schema, model } from 'mongoose';
import { UserAchievement, userAchievementSchema } from './user-achievment.interface';

export interface User {
	_id: Schema.Types.ObjectId;
	username: string;
	firstName: string;
	lastName: string;
	email: string;
	password: string;
	maxStreak: number;
	achievements: UserAchievement[];
	languages: {
    language: string;
    level: string;
  }[];
}

const userSchema = new Schema(
	{
		username: {
			type: String,
			required: true,
		},
		firstName: {
			type: String,
			required: true,
		},
		lastName: {
			type: String,
			required: true,
		},
		password: {
			type: String,
			required: true,
		},
		maxStreak: {
			type: String,
			default: 0,
		},
		email: {
			type: String,
			required: true,
		},
		achievements: [userAchievementSchema],
		languages: [
      {
        language: {
          type: String,
          required: true,
        },
        level: {
          type: String,
          required: true,
        },
      },
    ],
	},
	{
		timestamps: true,
	},
);

export const UserModel = model<User>('User', userSchema);
