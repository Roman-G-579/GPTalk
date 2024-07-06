import { Request, Response, NextFunction } from 'express';
import { UserModel } from '../models/user.interface';
import { VisitLogModel } from '../models/visit-log.interface';
import { Schema } from 'mongoose';
import { ResultModel } from '../models/language.interface';
import { UserProfile } from '../models/user-profile.interface';
import httpStatus from 'http-status';

export async function getUserProfile(req: Request, res: Response, next: NextFunction) {
	try {
		const { email } = req.body;
		const user = await UserModel.findOne({ email });

    if (!user) {
      return res.status(httpStatus.NOT_FOUND).json({ message: 'User not found' });
    }

    const [topPercentage, streak, latestResults, totalExp] = await Promise.all([
      calculateTopPercentage(user._id),
      calculateStreak(user._id),
      fetchLatestResults(user._id),
      calculateTotalExp(user._id),
    ]);

    const maxStreak = await calculateMaxStreak(user._id, streak);
    const level = calculateLevel(totalExp);

    const userProfile: UserProfile = {
      ...user.toObject(),
      password: undefined,
      country: '',
      bio: '',
      challengesCompleted: 0,
      maxStreak,
      totalExp,
      level,
      topPercentage,
      streak,
      latestResults,
    };

    return res.status(httpStatus.OK).send(userProfile);
	} catch (err) {
		next(err);
	}
}

async function calculateTopPercentage(userId: Schema.Types.ObjectId): Promise<number> {
  const users = await UserModel.find().sort({ totalExp: -1 }).exec();
  const userRank = users.findIndex(u => u._id.toString() === userId.toString()) + 1;
  const totalUsers = users.length;
  return ((totalUsers - userRank) / totalUsers) * 100;
}

async function calculateStreak(userId: Schema.Types.ObjectId): Promise<number> {
  const visitLogs = await VisitLogModel.find({
    user: userId,
  }).sort({ date: -1 }).exec();

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
    UserModel.findOneAndUpdate({_id: userId}, {maxStreak: streak}).exec();
    return streak;
  }
  return user.maxStreak;
}

async function fetchLatestResults(userId: Schema.Types.ObjectId) {
  return await ResultModel.find({ user: userId })
    .sort({ date: -1 })
    .limit(5)
    .exec();
}

export async function calculateTotalExp(userId: Schema.Types.ObjectId) {
  const results = await ResultModel.find({user: userId});
  return results.reduce((total, result) => total + result.exp, 0);
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
