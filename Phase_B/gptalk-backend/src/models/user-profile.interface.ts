import { Schema } from 'mongoose';
import { Result } from './language.interface';

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
	achievements: {
		title: string;
		level: number;
		progress: number;
		goal: number;
	}[];
	languages: {
		language: string;
		level: string;
	}[];
	latestResults: Result[];
}
