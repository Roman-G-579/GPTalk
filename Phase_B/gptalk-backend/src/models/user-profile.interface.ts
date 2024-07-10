import { Schema } from 'mongoose';
import { Result } from './result.interface';
import { Language } from './language.interface';
import { UserAchievement } from './user-achievment.interface';

export interface UserProfile {
	_id?: Schema.Types.ObjectId;
	username: string;
	firstName: string;
	lastName: string;
	email: string;
	password: string;
	level: number;
	streak: number;
	maxStreak: number;
	topPercentage: number;
	challengesCompleted: number;
	totalExp: number;
	country: string;
	bio: string;
	achievements: UserAchievement[];
	languages: Language[];
	latestResults: Result[];
}
