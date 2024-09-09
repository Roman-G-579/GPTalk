import { NextFunction, Request, Response } from 'express';
import { Schema } from 'mongoose';
import httpStatus from 'http-status';
import { UserModel } from '../models/user.interface';
import { VisitLogModel } from '../models/visit-log.interface';
import { Result, ResultModel } from '../models/result.interface';
import { UserProfile } from '../models/user-profile.interface';
import { LessonModel } from '../models/lesson.interface';
import { AchievementModel } from '../models/achievment.interface';
import { Language } from '../models/language.interface';
import { UserAchievement } from '../models/user-achievment.interface';
import { RankEnum } from '../models/enums/rank.enum';

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
			lessonsCompleted,
			noMistakes,
			languages,
		] = await Promise.all([
			calculateTopPercentage(user._id),
			calculateStreak(user._id),
			fetchLatestResults(user._id),
			calculateTotalExp(user._id),
			calculateLessonsCompleted(user._id),
			calculateNoMistakesLessons(user._id),
			calculateUserLanguages(user._id),
		]);

		const maxStreak = await calculateMaxStreak(user._id, streak);
		const level = calculateLevel(totalExp);
		const advancedOrMasterLanguages = calculateAdvancedOrMasterLanguages(languages);

		const achievements = await getAchievements(
			maxStreak,
			totalExp,
			noMistakes,
			lessonsCompleted,
			advancedOrMasterLanguages,
		);

		const userProfile: UserProfile = {
			...user.toObject(),
			password: undefined,
			country: '',
			bio: '',
			lessonsCompleted,
			maxStreak,
			totalExp,
			level,
			topPercentage,
			streak,
			latestResults: latestResults as Result[],
			languages,
			achievements,
		};

		return res.status(httpStatus.OK).send(userProfile);
	} catch (err) {
		next(err);
	}
}

/**
 * Adds a document to the results collection and the lessons collection,
 * containing the results of the latest lesson
 * @param req
 * @param res
 * @param next
 */
export async function postResult(req: Request, res: Response, next: NextFunction) {
	try {
		const { exp, email, numberOfQuestions, mistakes, language } = req.body;

		if (!email) {
			return res.status(400).json({ message: 'Missing data in postResult function' });
		}
		const user = await UserModel.findOne({ email });

		if (!user) {
			return res.status(httpStatus.NOT_FOUND).json({ message: 'User not found' });
		}

		// Create and save the new result document
		const resultDocument = new ResultModel({
			exp,
			user: user._id,
			language,
		});

		const result = await resultDocument.save();
		const lessonDocument = new LessonModel({
			numberOfQuestions,
			mistakes,
			user: user._id,
			result: result._id,
		});

		await lessonDocument.save();

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

export async function calculateMaxStreak(userId: Schema.Types.ObjectId, streak: number) {
	const user = await UserModel.findOne({ _id: userId });
	if (streak > user.maxStreak) {
		UserModel.findOneAndUpdate({ _id: userId }, { maxStreak: streak }).exec();
		return streak;
	}
	return user.maxStreak;
}

async function calculateLessonsCompleted(userId: Schema.Types.ObjectId) {
	return LessonModel.countDocuments({ user: userId });
}

async function fetchLatestResults(userId: Schema.Types.ObjectId) {
	return ResultModel.find({ user: userId }).sort({ date: -1 }).limit(4).exec();
}

async function calculateNoMistakesLessons(userId: Schema.Types.ObjectId) {
	return LessonModel.countDocuments({ user: userId, mistakes: 0 });
}

function calculateAdvancedOrMasterLanguages(languages: Language[]) {
	return languages.reduce(
		(accumulator, language) =>
			language.rank === RankEnum.Advanced || language.rank === RankEnum.Master
				? accumulator + 1
				: accumulator,
		0,
	);
}

export async function calculateTotalExp(userId: Schema.Types.ObjectId) {
	const results = await ResultModel.find({ user: userId });
	return results.reduce((total: number, result: Result) => total + result.exp, 0);
}

export function calculateLevel(totalExp: number): number {
	if (totalExp < 100) return 1;

	return Math.floor(Math.log2(totalExp / 100) + 1) + 1;
}

async function getAchievements(
	currentStreak: number,
	totalExp: number,
	noMistakes: number,
	totalLessons: number,
	totalLanguages: number,
): Promise<UserAchievement[]> {
	const [streak, exp, mistakes, lessons, languages] = await Promise.all([
		AchievementModel.find({ type: 'streak' }).lean(),
		AchievementModel.find({ type: 'exp' }).lean(),
		AchievementModel.find({ type: 'mistakes' }).lean(),
		AchievementModel.find({ type: 'lessons' }).lean(),
		AchievementModel.find({ type: 'languages' }).lean(),
	]);

	const achievements: UserAchievement[] = [
		{ ...streak[0], progress: currentStreak },
		{ ...exp[0], progress: totalExp },
		{ ...mistakes[0], progress: noMistakes },
		{ ...lessons[0], progress: totalLessons },
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
	updateAchievement(lessons, totalLessons, 3);
	updateAchievement(languages, totalLanguages, 4);

	return achievements;
}

export async function calculateUserLanguages(userId: Schema.Types.ObjectId): Promise<Language[]> {
	const aggregatedResults = await ResultModel.aggregate([
		{ $match: { user: userId } },
		{
			$group: {
				_id: '$language',
				totalExp: { $sum: '$exp' },
			},
		},
		{
			$project: {
				language: '$_id',
				totalExp: 1,
				_id: 0,
			},
		},
	]);

	const languagesWithRanks: Language[] = aggregatedResults.map((result) => ({
		language: result.language,
		rank: calculateRank(result.totalExp),
	}));

	return languagesWithRanks;
}

function calculateRank(totalExp: number): RankEnum {
	if (totalExp < 5000) {
		return RankEnum.Novice;
	} else if (totalExp < 10000) {
		return RankEnum.Advanced;
	} else {
		return RankEnum.Master;
	}
}
