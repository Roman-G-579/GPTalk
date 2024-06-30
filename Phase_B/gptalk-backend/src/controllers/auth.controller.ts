import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import HttpStatus from 'http-status';
import jwt from 'jsonwebtoken';
import { UserModel } from '../models/user.interface';
import { Config } from '../config/config';

/**
 * Logs a user to the app
 */
export async function loginMiddleware(req: Request, res: Response, next: NextFunction) {
	try {
		const { email, password } = req.body;

		// Check if email and password are provided
		if (!email || !password) {
			return res
				.status(HttpStatus.BAD_REQUEST)
				.json({ message: 'Email and password are required' });
		}

		// Find the user by email
		const user = await UserModel.findOne({ email });
		if (!user) {
			return res.status(HttpStatus.UNAUTHORIZED).json({ message: 'Invalid email or password' });
		}

		// Compare the provided password with the stored hashed password
		const isMatch = await bcrypt.compare(password, user.password);
		if (!isMatch) {
			return res.status(HttpStatus.UNAUTHORIZED).json({ message: 'Invalid email or password' });
		}

		// Generate a JWT token
		const token = jwt.sign({ email: user.email }, Config.JWT_SECRET, {
			expiresIn: '1h',
		});

		user.password = undefined;

		// Return the token
		return res.status(HttpStatus.OK).json({ token, user });
	} catch (err) {
		next(err);
	}
}

export async function getUserByTokenMiddleware(req: Request, res: Response, next: NextFunction) {
	try {
		req.user.password = undefined;
		return res.status(HttpStatus.OK).json(req.user);
	} catch (err) {
		next(err);
	}
}
