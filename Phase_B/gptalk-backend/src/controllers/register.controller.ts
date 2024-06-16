import { Request, Response, NextFunction } from 'express';
import { UserModel } from '../models/user.interface';
import nodemailer from 'nodemailer';
import bcrypt from 'bcrypt';
import { Config } from '../config/config';

const SALT_ROUNDS = parseInt(process.env.SALT_ROUNDS) || 10;

/**
 * Creates a user with the given details
 * @param req the registration request query
 * @param res the response object sent by Express
 * @param next the next middleware in the stack
 */
export async function registerMiddleware(req: Request, res: Response, next: NextFunction) {
	try {
		const { username, password, firstName, lastName, email } = req.body;

		let transporter = nodemailer.createTransport({
			service: 'gmail',
			auth: {
				user: Config.ADMIN_EMAIL,
				pass: Config.ADMIN_PASSWORD,
			},
			tls: {
				rejectUnauthorized: false
			}
		});

		let mailOptions = {
			from: Config.ADMIN_EMAIL,
			to: email,
			subject: 'Welcome to GPTalk!',
			text: `${firstName}, \n your account has been created. Welcome to GPTalk!`
		};

		transporter.sendMail(mailOptions, function(err, info){
			if (err) {
				console.log(err);
			} else {
				console.log('Email sent: ' + info.response);
			}
		});

		const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
		await UserModel.create({username, password: hashedPassword, firstName, lastName, email: email.toLowerCase() });
		return res.send({response: 'success', email: email.toLowerCase(), firstName, lastName});

	} catch (err) {
		next(err);
	}
}
