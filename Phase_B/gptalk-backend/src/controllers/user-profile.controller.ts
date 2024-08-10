import { NextFunction, Request, Response } from 'express';
import { UserModel } from '../models/user.interface';
import { VisitLogModel } from '../models/visit-log.interface';
import { Schema } from 'mongoose';
import { Result, ResultModel } from '../models/result.interface';
import { UserProfile } from '../models/user-profile.interface';
import httpStatus from 'http-status';
import { ChallengeModel } from '../models/challenge.interface';
import { AchievementModel } from '../models/achievment.interface';
import { Language, LanguageModel } from '../models/language.interface';
import { UserAchievement } from '../models/user-achievment.interface';

export async function getUserProfile(req: Request, res: Response, next: NextFunction) {
	try {
		const { email } = req.params;
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
			allLanguages,
		] = await Promise.all([
			calculateTopPercentage(user._id),
			calculateStreak(user._id),
			fetchLatestResults(user._id),
			calculateTotalExp(user._id),
			calculateChallengesCompleted(user._id),
			calculateNoMistakesChallenges(user._id),
			calculateExpertOrMasterLanguages(user._id),
			getAllLanguages(user._id),
		]);

		const maxStreak = await calculateMaxStreak(user._id, streak);
		const level = calculateLevel(totalExp);

		const achievements = await getAchievements(
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
			latestResults: latestResults as Result[],
			languages: allLanguages as Language[],
			achievements,
		};

		return res.status(httpStatus.OK).send(userProfile);
	} catch (err) {
		next(err);
	}
}

/**
 * Returns the progress to the next level
 * And the exp required for the next level
 * @param req
 * @param res
 * @param next
 */
export async function getLevelInfo(req: Request, res: Response, next: NextFunction) {
		try {
			const { email } = req.params;
			const user = await UserModel.findOne({ email });

			if (!user) {
				return res.status(httpStatus.NOT_FOUND).json({ message: 'User not found' });
			}

			let level = 1;
			let expForNextLevel = 100;

			let totalExp = await calculateTotalExp(user._id);

			let remainingExp = totalExp;
			// Calculate the level and the remaining experience
			while (remainingExp >= expForNextLevel) {
				remainingExp -= expForNextLevel;
				level++;
				expForNextLevel *= 2;
			}
			return res.status(httpStatus.OK).send({level, totalExp, expForNextLevel});
	} catch (err) {
			next(err);
	}
}

export async function postResult(req: Request, res: Response, next: NextFunction) {
	try {
			const { exp, email, numberOfQuestions, mistakes } = req.body

			if (!exp || !email) {
				return res.status(400).json({ message: 'Missing data in postResult function' });
			}
			const user = await UserModel.findOne({ email });

			if (!user) {
				return res.status(httpStatus.NOT_FOUND).json({ message: 'User not found' });
			}

			// Create and save the new result document
			const resultDocument = new ResultModel({
				exp,
				user: user._id
			});

			const result = await resultDocument.save();

			const challengeDocument = new ChallengeModel({
				numberOfQuestions,
				mistakes,
				user: user._id,
				result: result._id
			});

			await challengeDocument.save();

			res.status(200).json(result);

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
	return ResultModel.find({ user: userId }).sort({ date: -1 }).limit(4).exec();
}

async function calculateNoMistakesChallenges(userId: Schema.Types.ObjectId) {
	return ChallengeModel.countDocuments({ user: userId, mistakes: 0 });
}

async function getAllLanguages(userId: Schema.Types.ObjectId) {
	return LanguageModel.find({ user: userId });
}

async function calculateExpertOrMasterLanguages(userId: Schema.Types.ObjectId) {
	return LanguageModel.find({ user: userId, rank: { $in: ['Expert', 'Master'] } });
}

export async function calculateTotalExp(userId: Schema.Types.ObjectId) {
	const results = await ResultModel.find({ user: userId });
	console.log('hi');
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



async function getAchievements(
	currentStreak: number,
	totalExp: number,
	noMistakes: number,
	totalChallenges: number,
	totalLanguages: number,
): Promise<UserAchievement[]> {
	const [streak, exp, mistakes, challenges, languages] = await Promise.all([
		AchievementModel.find({ type: 'streak' }).lean(),
		AchievementModel.find({ type: 'exp' }).lean(),
		AchievementModel.find({ type: 'mistakes' }).lean(),
		AchievementModel.find({ type: 'challenges' }).lean(),
		AchievementModel.find({ type: 'languages' }).lean(),
	]);

	const achievements: UserAchievement[] = [
		{ ...streak[0], progress: currentStreak },
		{ ...exp[0], progress: totalExp },
		{ ...mistakes[0], progress: noMistakes },
		{ ...challenges[0], progress: totalChallenges },
		{ ...languages[0], progress: totalLanguages },
	];

	const updateAchievement = (
		achievementArray: any[],
		progress: number,
		achievementIndex: number,
	) => {
		for (let i = 1; i < achievementArray.length; i++) {
			if (
				(i === achievementArray.length - 1 &&
					achievementArray[achievementArray.length - 1].goal <= progress) ||
				(achievementArray[i].goal > progress && achievementArray[i - 1].goal <= progress)
			) {
				achievements[achievementIndex] = {
					...achievementArray[i === achievementArray.length - 1 ? achievementArray.length - 1 : i],
					progress,
				};
				break;
			}
		}
	};

	updateAchievement(streak, currentStreak, 0);
	updateAchievement(exp, totalExp, 1);
	updateAchievement(mistakes, noMistakes, 2);
	updateAchievement(challenges, totalChallenges, 3);
	updateAchievement(languages, totalLanguages, 4);

	return achievements;
}
