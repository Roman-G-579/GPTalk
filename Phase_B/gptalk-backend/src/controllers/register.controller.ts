import { Request, Response, NextFunction } from 'express';
import { UserModel } from '../models/user.interface';
import bcrypt from 'bcrypt';
import { Config } from '../config/config';
import { sendMail } from './mail.controller';

/**
 * Creates a user with the given details
 */
export async function registerMiddleware(req: Request, res: Response, next: NextFunction) {
	try {
		// Get parameters from request body
		const { username, password, firstName, lastName, email } = req.body;

		// Check if a user with the given email already exists in the database
		const emailExists = await isExist(email);

		if (emailExists) {
			throw new Error('Account with this Email already exists');
		}

		// Setting the mail options
		const mailOptions = {
			from: Config.ADMIN_EMAIL,
			to: email,
			subject: 'Welcome to GPTalk!',
			text: `${firstName}, \n your account has been created. Welcome to GPTalk!`,
		};

		// Hashes the password and creates the user
		const hashedPassword = await bcrypt.hash(password, Config.SALT_ROUNDS);
		await UserModel.create({
			username,
			password: hashedPassword,
			firstName,
			lastName,
			email: email.toLowerCase(),
		});

		// Sends a welcome email to the newly created user
		const result = await sendMail(mailOptions);
		if (!result) {
			throw new Error('Could not send mail');
		}

		// Returns successful response
		return res.send({ response: 'success', email: email.toLowerCase(), firstName, lastName });
	} catch (err) {
		next(err);
	}
}

// Returns true if document in the database contains the given email, otherwise returns false
async function isExist(email: string): Promise<boolean> {
	const exist = await UserModel.findOne({ email });

	return !!exist;
}
