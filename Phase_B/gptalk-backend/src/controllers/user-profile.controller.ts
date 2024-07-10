import { Request, Response, NextFunction } from 'express';
import { UserModel } from '../models/user.interface';
import { VisitLogModel } from '../models/visit-log.interface';
import { Schema } from 'mongoose';
import { ResultModel } from '../models/result.interface';
import { UserProfile } from '../models/user-profile.interface';
import httpStatus from 'http-status';
import { ChallengeModel } from '../models/challenge.interface';
import { AchievementModel } from '../models/achievment.interface';
import { Result } from '../models/result.interface';
import { LanguageModel } from '../models/language.interface';
import { UserAchievement } from '../models/user-achievment.interface';

export async function getUserProfile(req: Request, res: Response, next: NextFunction) {
	try {
		const { email } = req.body;
		const user = await UserModel.findOne({ email });

		if (!user) {
			return res.status(httpStatus.NOT_FOUND).json({ message: 'User not found' });
		}

		const [
			topPercentage,
			streak,
			latestResults,
			totalExp,
			challengesCompleted,
			noMistakes,
			languages,
		] = await Promise.all([
			calculateTopPercentage(user._id),
			calculateStreak(user._id),
			fetchLatestResults(user._id),
			calculateTotalExp(user._id),
			calculateChallengesCompleted(user._id),
			calculateNoMistakesChallenges(user._id),
			calculateExpertOrMasterLanguages(user._id),
		]);

		const maxStreak = await calculateMaxStreak(user._id, streak);
		const level = calculateLevel(totalExp);

		const achievements = await getAchievments(
			maxStreak,
			totalExp,
			noMistakes,
			challengesCompleted,
			languages.length,
		);

		const userProfile: UserProfile = {
			...user.toObject(),
			password: undefined,
			country: '',
			bio: '',
			challengesCompleted,
			maxStreak,
			totalExp,
			level,
			topPercentage,
			streak,
			latestResults,
			languages,
			achievements,
		};

		return res.status(httpStatus.OK).send(userProfile);
	} catch (err) {
		next(err);
	}
}

async function calculateTopPercentage(userId: Schema.Types.ObjectId): Promise<number> {
	const users = await UserModel.find().sort({ totalExp: -1 }).exec();
	const userRank = users.findIndex((u) => u._id.toString() === userId.toString()) + 1;
	const totalUsers = users.length;
	return ((totalUsers - userRank) / totalUsers) * 100;
}

async function calculateStreak(userId: Schema.Types.ObjectId): Promise<number> {
	const visitLogs = await VisitLogModel.find({
		user: userId,
	})
		.sort({ date: -1 })
		.exec();

	let streak = 0;
	let currentDate = new Date();
	currentDate.setHours(0, 0, 0, 0);

	for (let log of visitLogs) {
		const logDate = new Date(log.date);
		logDate.setHours(0, 0, 0, 0);

		if (logDate.getTime() === currentDate.getTime()) {
			streak++;
			currentDate.setDate(currentDate.getDate() - 1);
		} else if (logDate.getTime() === currentDate.getTime() - 24 * 60 * 60 * 1000) {
			streak++;
			currentDate = logDate;
		} else {
			break;
		}
	}

	return streak;
}

async function calculateMaxStreak(userId: Schema.Types.ObjectId, streak: number) {
	const user = await UserModel.findOne({ _id: userId });
	if (streak > user.maxStreak) {
		UserModel.findOneAndUpdate({ _id: userId }, { maxStreak: streak }).exec();
		return streak;
	}
	return user.maxStreak;
}

async function calculateChallengesCompleted(userId: Schema.Types.ObjectId) {
	return ChallengeModel.countDocuments({ user: userId });
}

async function fetchLatestResults(userId: Schema.Types.ObjectId) {
	return ResultModel.find({ user: userId }).sort({ date: -1 }).limit(5).exec();
}

async function calculateNoMistakesChallenges(userId: Schema.Types.ObjectId) {
	return ChallengeModel.countDocuments({ user: userId, mistakes: 0 });
}

async function calculateExpertOrMasterLanguages(userId: Schema.Types.ObjectId) {
	return LanguageModel.find({ user: userId, rank: { $in: ['Expert', 'Master'] } });
}

export async function calculateTotalExp(userId: Schema.Types.ObjectId) {
	const results = await ResultModel.find({ user: userId });
	return results.reduce((total: number, result: Result) => total + result.exp, 0);
}

export function calculateLevel(totalExp: number): number {
	let level = 1;
	let expForNextLevel = 100;

	while (totalExp >= expForNextLevel) {
		totalExp -= expForNextLevel;
		level++;
		expForNextLevel *= 2;
	}

	return level;
}

async function getAchievments(
	currentStreak: number,
	totalExp: number,
	noMistakes: number,
	totalChallenges: number,
	totalLanguages: number,
): Promise<UserAchievement[]> {
	const [streak, exp, mistakes, challenges, languages] = await Promise.all([
		AchievementModel.find({ type: 'streak' }),
		AchievementModel.find({ type: 'exp' }),
		AchievementModel.find({ type: 'mistakes' }),
		AchievementModel.find({ type: 'challanges' }),
		AchievementModel.find({ type: 'languages' }),
	]);

	for (const achievment of [streak, exp, mistakes, challenges, languages]) {
		achievment.map((x) => x.toObject());
	}

	const achievments: UserAchievement[] = [
		{ ...streak[0], progress: currentStreak },
		{ ...exp[0], progress: totalExp },
		{ ...mistakes[0], progress: noMistakes },
		{ ...challenges[0], progress: totalChallenges },
		{ ...languages[0], progress: totalLanguages },
	];

	// Streak
	for (let i = 1; i < streak.length; i++) {
		if (i === streak.length - 1 && streak[streak.length - 1].goal <= currentStreak) {
			achievments[0] = { ...streak[streak.length - 1], progress: currentStreak };
		}
		if (streak[i].goal > currentStreak && streak[i - 1].goal <= currentStreak) {
			achievments[0] = { ...streak[i], progress: currentStreak };
			break;
		}
	}

	// Exp
	for (let i = 1; i < exp.length; i++) {
		if (i === exp.length - 1 && exp[exp.length - 1].goal <= totalExp) {
			achievments[1] = { ...exp[exp.length - 1], progress: totalExp };
		}
		if (exp[i].goal > totalExp && exp[i - 1].goal <= totalExp) {
			achievments[1] = { ...exp[i], progress: totalExp };
			break;
		}
	}

	// No mistakes
	for (let i = 1; i < mistakes.length; i++) {
		if (i === mistakes.length - 1 && mistakes[mistakes.length - 1].goal <= noMistakes) {
			achievments[2] = { ...mistakes[mistakes.length - 1], progress: noMistakes };
		}
		if (mistakes[i].goal > noMistakes && mistakes[i - 1].goal <= noMistakes) {
			achievments[2] = { ...mistakes[i], progress: noMistakes };
			break;
		}
	}

	// Challenges
	for (let i = 1; i < challenges.length; i++) {
		if (i === challenges.length - 1 && challenges[challenges.length - 1].goal <= totalChallenges) {
			achievments[3] = { ...challenges[challenges.length - 1], progress: totalChallenges };
		}
		if (challenges[i].goal > totalChallenges && challenges[i - 1].goal <= totalChallenges) {
			achievments[3] = { ...challenges[i], progress: totalChallenges };
			break;
		}
	}

	// Languages
	for (let i = 1; i < languages.length; i++) {
		if (i === languages.length - 1 && languages[languages.length - 1].goal <= totalLanguages) {
			achievments[4] = { ...languages[languages.length - 1], progress: totalLanguages };
		}
		if (languages[i].goal > totalLanguages && languages[i - 1].goal <= totalLanguages) {
			achievments[4] = { ...languages[i], progress: totalLanguages };
			break;
		}
	}

	return achievments;
}
