// Import necessary modules and interfaces from external libraries
import { NextFunction, Request, Response } from 'express';
import { Schema } from 'mongoose';
import httpStatus from 'http-status';

// Import custom models and interfaces
import { UserModel } from '../models/user.interface';
import { VisitLogModel } from '../models/visit-log.interface';
import { Result, ResultModel } from '../models/result.interface';
import { UserProfile } from '../models/user-profile.interface';
import { LessonModel } from '../models/lesson.interface';
import { Language } from '../models/language.interface';
import { UserAchievement } from '../models/user-achievment.interface';
import { RankEnum } from '../models/enums/rank.enum';
import { exp, languages, lessons, mistakes, streak } from './achievements';

/**
 * Retrieves the user profile along with calculated statistics and achievements.
 * @param req - The HTTP request object.
 * @param res - The HTTP response object.
 * @param next - The next middleware function.
 */
export async function getUserProfile(req: Request, res: Response, next: NextFunction) {
	try {
		// Extract email from request parameters
		const { email } = req.params;
		const user = await UserModel.findOne({ email });

		// If user not found, return 404 Not Found
		if (!user) {
			return res.status(httpStatus.NOT_FOUND).json({ message: 'User not found' });
		}

		// Calculate various user statistics concurrently
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

		// Calculate maximum streak and level
		const maxStreak = await calculateMaxStreak(user._id, streak);
		const level = calculateLevel(totalExp);

		// Determine the number of languages where the user is Advanced or Master
		const advancedOrMasterLanguages = calculateAdvancedOrMasterLanguages(languages);

		// Get user achievements based on calculated statistics
		const achievements = await getAchievements(
			maxStreak,
			totalExp,
			noMistakes,
			lessonsCompleted,
			advancedOrMasterLanguages,
		);

		// Construct the user profile object to be returned
		const userProfile: UserProfile = {
			...user.toObject(),
			password: undefined, // Exclude sensitive information
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

		// Send the user profile as a response
		return res.status(httpStatus.OK).send(userProfile);
	} catch (err) {
		next(err);
	}
}

/**
 * Stores the result of a user's lesson and updates their progress.
 * @param req - The HTTP request object.
 * @param res - The HTTP response object.
 * @param next - The next middleware function.
 */
export async function postResult(req: Request, res: Response, next: NextFunction) {
	try {
		// Extract required data from the request body
		const { exp, email, numberOfQuestions, mistakes, language } = req.body;

		// If email is missing, return 400 Bad Request
		if (!email) {
			return res.status(400).json({ message: 'Missing data in postResult function' });
		}
		const user = await UserModel.findOne({ email });

		// If user not found, return 404 Not Found
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

		// Create and save the new lesson document
		const lessonDocument = new LessonModel({
			numberOfQuestions,
			mistakes,
			user: user._id,
			result: result._id,
		});

		await lessonDocument.save();

		// Return the result as a response
		res.status(200).json(result);
	} catch (err) {
		next(err);
	}
}

/**
 * Calculates the user's ranking as a top percentage based on total experience.
 * @param userId - The user's ID.
 * @returns The user's top percentage ranking.
 */
async function calculateTopPercentage(userId: Schema.Types.ObjectId): Promise<number> {
	// Fetch all users sorted by total experience in descending order
	const users = await UserModel.find().sort({ totalExp: -1 }).exec();
	// Find the user's rank
	const userRank = users.findIndex((u) => u._id.toString() === userId.toString()) + 1;
	const totalUsers = users.length;
	// Calculate the top percentage
	return ((totalUsers - userRank) / totalUsers) * 100;
}

/**
 * Calculates the user's current login streak.
 * @param userId - The user's ID.
 * @returns The current streak count.
 */
async function calculateStreak(userId: Schema.Types.ObjectId): Promise<number> {
	// Fetch all visit logs for the user, sorted by date descending
	const visitLogs = await VisitLogModel.find({
		user: userId,
	})
		.sort({ date: -1 })
		.exec();

	let streak = 0;
	// Start from today's date at midnight
	let currentDate = new Date();
	currentDate.setHours(0, 0, 0, 0);

	for (let log of visitLogs) {
		const logDate = new Date(log.date);
		logDate.setHours(0, 0, 0, 0);

		if (logDate.getTime() === currentDate.getTime()) {
			// Visited today
			streak++;
			// Move to previous day
			currentDate.setDate(currentDate.getDate() - 1);
		} else if (logDate.getTime() === currentDate.getTime() - 24 * 60 * 60 * 1000) {
			// Visited on previous day
			streak++;
			currentDate = logDate;
		} else {
			// Streak is broken
			break;
		}
	}

	return streak;
}

/**
 * Updates and returns the user's maximum streak.
 * @param userId - The user's ID.
 * @param streak - The current streak count.
 * @returns The maximum streak.
 */
export async function calculateMaxStreak(userId: Schema.Types.ObjectId, streak: number) {
	const user = await UserModel.findOne({ _id: userId });
	if (streak > user.maxStreak) {
		// Update the user's max streak in the database
		await UserModel.findOneAndUpdate({ _id: userId }, { maxStreak: streak }).exec();
		return streak;
	}
	return user.maxStreak;
}

/**
 * Calculates the total number of lessons completed by the user.
 * @param userId - The user's ID.
 * @returns The number of lessons completed.
 */
async function calculateLessonsCompleted(userId: Schema.Types.ObjectId) {
	// Count the number of lesson documents associated with the user
	return LessonModel.countDocuments({ user: userId });
}

/**
 * Fetches the user's latest results.
 * @param userId - The user's ID.
 * @returns An array of the latest results.
 */
async function fetchLatestResults(userId: Schema.Types.ObjectId) {
	// Fetch the last 4 results sorted by date descending
	return ResultModel.find({ user: userId }).sort({ date: -1 }).limit(4).exec();
}

/**
 * Calculates the number of lessons the user completed without mistakes.
 * @param userId - The user's ID.
 * @returns The count of flawless lessons.
 */
async function calculateNoMistakesLessons(userId: Schema.Types.ObjectId) {
	// Count the number of lessons with zero mistakes
	return LessonModel.countDocuments({ user: userId, mistakes: 0 });
}

/**
 * Calculates the number of languages where the user has Advanced or Master rank.
 * @param languages - An array of the user's languages.
 * @returns The count of advanced or master languages.
 */
function calculateAdvancedOrMasterLanguages(languages: Language[]) {
	return languages.reduce(
		(accumulator, language) =>
			language.rank === RankEnum.Advanced || language.rank === RankEnum.Master
				? accumulator + 1
				: accumulator,
		0,
	);
}

/**
 * Calculates the total experience points earned by the user.
 * @param userId - The user's ID.
 * @returns The total experience points.
 */
export async function calculateTotalExp(userId: Schema.Types.ObjectId) {
	// Fetch all results associated with the user
	const results = await ResultModel.find({ user: userId });
	// Sum up the experience points from all results
	return results.reduce((total: number, result: Result) => total + result.exp, 0);
}

/**
 * Calculates the user's level based on total experience.
 * @param totalExp - The total experience points.
 * @returns The user's level.
 */
export function calculateLevel(totalExp: number): number {
	if (totalExp < 100) return 1;
	// Level calculation using logarithmic scaling
	return Math.floor(Math.log2(totalExp / 100) + 1) + 1;
}

/**
 * Determines the user's achievements based on their statistics.
 * @param currentStreak - The current login streak.
 * @param totalExp - The total experience points.
 * @param noMistakes - The number of flawless lessons.
 * @param totalLessons - The total number of lessons completed.
 * @param totalLanguages - The number of advanced or master languages.
 * @returns An array of the user's achievements.
 */
async function getAchievements(
	currentStreak: number,
	totalExp: number,
	noMistakes: number,
	totalLessons: number,
	totalLanguages: number,
): Promise<UserAchievement[]> {
	// Initialize achievements with default progress
	const achievements: UserAchievement[] = [
		{ ...streak[0], progress: currentStreak },
		{ ...exp[0], progress: totalExp },
		{ ...mistakes[0], progress: noMistakes },
		{ ...lessons[0], progress: totalLessons },
		{ ...languages[0], progress: totalLanguages },
	];

	// Function to update achievement based on progress
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

	// Update each achievement category
	updateAchievement(streak, currentStreak, 0);
	updateAchievement(exp, totalExp, 1);
	updateAchievement(mistakes, noMistakes, 2);
	updateAchievement(lessons, totalLessons, 3);
	updateAchievement(languages, totalLanguages, 4);

	return achievements;
}

/**
 * Calculates the user's progress and rank in each language.
 * @param userId - The user's ID.
 * @returns An array of languages with ranks and experience details.
 */
export async function calculateUserLanguages(userId: Schema.Types.ObjectId): Promise<Language[]> {
	// Aggregate total experience per language
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

	// Map results to language objects with ranks and experience needed for next rank
	const languagesWithRanks: Language[] = aggregatedResults.map((result) => ({
		language: result.language,
		rank: calculateRank(result.totalExp),
		exp: result.totalExp,
		expToNextRank: calculateExpToNextRank(result.totalExp),
	}));
	return languagesWithRanks;
}

/**
 * Determines the rank based on total experience in a language.
 * @param totalExp - The total experience points in a language.
 * @returns The rank enumeration.
 */
function calculateRank(totalExp: number): RankEnum {
	if (totalExp < 5000) {
		return RankEnum.Novice;
	} else if (totalExp < 10000) {
		return RankEnum.Advanced;
	} else {
		return RankEnum.Master;
	}
}

/**
 * Calculates the experience points needed to reach the next rank.
 * @param totalExp - The total experience points in a language.
 * @returns The experience points needed for the next rank.
 */
function calculateExpToNextRank(totalExp: number) {
	// Next rank is Advanced
	if (totalExp < 5000) {
		return 5000 - totalExp;
	}
	// Next rank is Master
	else if (totalExp < 10000) {
		return 10000 - totalExp;
	}
	// Max rank achieved
	else {
		return 0;
	}
}
