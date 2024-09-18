import { NextFunction, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import HttpStatus from 'http-status';
import jwt from 'jsonwebtoken';
import { UserModel } from '../models/user.interface';
import { Config } from '../config/config';
import { calculateTotalExp, calculateUserLanguages } from './user-profile.controller';

/**
 * Middleware to authenticate a user by email and password.
 * Generates a JWT token if authentication is successful.
 *
 * @param req - The HTTP request object containing the email and password in the body.
 * @param res - The HTTP response object used to send the token and user details.
 * @param next - The next middleware function in the Express pipeline.
 * @returns Returns a JWT token and user details if authentication is successful.
 */
export async function loginMiddleware(req: Request, res: Response, next: NextFunction) {
	try {
		// Destructure email and password from request body
		const { email, password } = req.body;

		// Check if both email and password are provided
		if (!email || !password) {
			return res
				.status(HttpStatus.BAD_REQUEST)
				.json({ message: 'Email and password are required' });
		}

		// Find the user by email in the database
		const user = await UserModel.findOne({ email });
		if (!user) {
			return res.status(HttpStatus.UNAUTHORIZED).json({ message: 'Invalid email or password' });
		}

		// Compare the entered password with the stored hashed password
		const isMatch = await bcrypt.compare(password, user.password);
		if (!isMatch) {
			return res.status(HttpStatus.UNAUTHORIZED).json({ message: 'Invalid email or password' });
		}

		// Generate a JWT token valid for 1 hour
		const token = jwt.sign({ email: user.email }, Config.JWT_SECRET, {
			expiresIn: '1h',
		});

		// Hide password in the response by setting it to undefined
		user.password = undefined;

		// Calculate total experience and languages associated with the user
		user.totalExp = await calculateTotalExp(user._id);
		user.languages = await calculateUserLanguages(user._id);

		// Send token and user information back to the client
		return res.status(HttpStatus.OK).json({ token, user });
	} catch (err) {
		// Pass any error to the next middleware (error handler)
		next(err);
	}
}

/**
 * Middleware to retrieve the authenticated user's data based on their JWT token.
 *
 * @param req - The HTTP request object, containing the user info from the token.
 * @param res - The HTTP response object used to send the user's information.
 * @param next - The next middleware function in the Express pipeline.
 * @returns Returns the user object (without password) in the response.
 */
export async function getUserByTokenMiddleware(req: Request, res: Response, next: NextFunction) {
	try {
		// Hide the password from the user object before sending it
		req.user.password = undefined;

		// Send the user object back to the client
		return res.status(HttpStatus.OK).json(req.user);
	} catch (err) {
		// Pass any error to the next middleware (error handler)
		next(err);
	}
}
