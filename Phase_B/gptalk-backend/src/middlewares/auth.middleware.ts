import passport from 'passport';
import { Request, Response, NextFunction } from 'express';
import HttpStatus from 'http-status';
import { User } from '../models/user.interface';
import { VisitLogModel } from '../models/visit-log.interface';
import mongoose from 'mongoose';
import { calculateTotalExp, calculateUserLanguages } from '../controllers/user-profile.controller'; // Import utility functions for calculating user stats

/**
 * Extends the Express Request interface to include the authenticated user object.
 */
interface AuthenticatedRequest extends Request {
	user?: User; // Optional user field for the authenticated user
}

/**
 * Middleware to authenticate users using JWT strategy and passport.
 * Adds the user to the request object, calculates their total experience (exp) and languages, and logs their visit.
 * 
 * @param req - The HTTP request object, extended to include the authenticated user.
 * @param res - The HTTP response object used to send any error or unauthorized status.
 * @param next - The next middleware function in the Express pipeline.
 * @returns Proceeds to the next middleware if authentication is successful, otherwise returns an error or unauthorized status.
 */
export const authMiddleware = async (
	req: AuthenticatedRequest,
	res: Response,
	next: NextFunction,
) => {
	passport.authenticate(
		'jwt',
		{ session: false }, // Disable session since JWT strategy is stateless
		async (err: Error, user: User, info: unknown) => {
			if (err) {
				console.error('Error in authMiddleware:', err); // Log the error
				return next(err); // Pass the error to the next middleware
			}
			if (!user) {
				// If no user is found, return 401 Unauthorized
				return res.status(HttpStatus.UNAUTHORIZED).json({ message: 'Unauthorized' });
			}

			// Calculate the user's total experience points and languages
			user.totalExp = await calculateTotalExp(user._id);
			user.languages = await calculateUserLanguages(user._id);

			// Attach the user to the request object
			req.user = user;

			// Log the user's visit to the system
			await logUserVisit(user);

			// Proceed to the next middleware
			next();
		},
	)(req, res, next);
};

/**
 * Logs the user's visit to the system if they haven't already visited today.
 * Creates a log entry if no visit is found for the current day.
 * 
 * @param user - The authenticated user object.
 * @returns Creates a visit log entry for the user if they haven't visited today.
 */
export const logUserVisit = async (user: User) => {
	// Create start and end of the current day to filter visit logs by date
	const startOfDay = new Date();
	startOfDay.setHours(0, 0, 0, 0); // Set time to start of day

	const endOfDay = new Date();
	endOfDay.setHours(23, 59, 59, 999); // Set time to end of day

	try {
		// Check if the user has a visit log for today
		const visitLog = await VisitLogModel.findOne({
			user: user._id, // Find logs for the current user
			date: {
				$gte: startOfDay, // Date is greater than or equal to start of the day
				$lte: endOfDay, // Date is less than or equal to end of the day
			},
		});

		// If no visit log is found for today, create one
		if (!visitLog) {
			await VisitLogModel.create({
				user: user._id, // User's ID
				date: new Date(), // Current date
			});
		}
	} catch (error) {
		console.error('Error checking/creating visit log:', error); // Log any errors that occur
	}
};
