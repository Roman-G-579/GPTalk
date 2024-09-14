import passport from 'passport';
import { Request, Response, NextFunction } from 'express';
import HttpStatus from 'http-status';
import { User } from '../models/user.interface'; // Import the IUser interface
import { VisitLogModel } from '../models/visit-log.interface';
import mongoose from 'mongoose';
import { calculateTotalExp, calculateUserLanguages } from '../controllers/user-profile.controller';

interface AuthenticatedRequest extends Request {
	user?: User; // Extend the Request interface to include user
}

export const authMiddleware = async (
	req: AuthenticatedRequest,
	res: Response,
	next: NextFunction,
) => {
	passport.authenticate(
		'jwt',
		{ session: false },
		async (err: Error, user: User, info: unknown) => {
			if (err) {
				console.error('Error in authMiddleware:', err); // Log any error
				return next(err);
			}
			if (!user) {
				return res.status(HttpStatus.UNAUTHORIZED).json({ message: 'Unauthorized' });
			}
			user.totalExp = await calculateTotalExp(user._id);
			user.languages = await calculateUserLanguages(user._id);
			req.user = user;

			await logUserVisit(user);

			next();
		},
	)(req, res, next);
};

export const logUserVisit = async (user: User) => {
	const startOfDay = new Date();
	startOfDay.setHours(0, 0, 0, 0);

	const endOfDay = new Date();
	endOfDay.setHours(23, 59, 59, 999);

	try {
		const visitLog = await VisitLogModel.findOne({
			user: user._id,
			date: {
				$gte: startOfDay,
				$lte: endOfDay,
			},
		});

		if (!visitLog) {
			await VisitLogModel.create({
				user: user._id,
				date: new Date(),
			});
		}
	} catch (error) {
		console.error('Error checking/creating visit log:', error);
	}
};
