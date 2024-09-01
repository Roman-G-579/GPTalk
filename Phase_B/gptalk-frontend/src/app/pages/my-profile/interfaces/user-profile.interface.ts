import { Language } from '../components/profile-languages/language.interface';
import { Result } from './result.interface';
import { UserAchievement } from './user-achievements.interface';

export interface UserProfile {
	_id?: string;
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
	createdAt: string;
	userAvatar?: string;
}
