import { Request, Response, NextFunction } from 'express';
import { UserModel } from '../models/user.interface';

export async function getUserMiddleware(req: Request, res: Response, next: NextFunction) {
	try {
		// get the mongo id from the request body
		const { id: _id } = req.params;

		// get the user from the database
		const result = await UserModel.findById({ _id });

		// return the result
		return res.send({ result });
	} catch (err) {
		next(err);
	}
}

export async function editUserMiddleware(req: Request, res: Response, next: NextFunction) {
	try {
		// get the data from the request body
		const { id: _id } = req.params;
		const { username, email, age, role } = req.body;

		// update the data
		const result = await UserModel.findByIdAndUpdate(
			{ _id },
			{ username, email, age, role },
			{ new: true },
		);

		// return the result
		return res.send({ result });
	} catch (err) {
		next(err);
	}
}

export async function deleteUserMiddleware(req: Request, res: Response, next: NextFunction) {
	try {
		// get the mongo id from the request body
		const { id: _id } = req.params;

		// delete the user
		const result = await UserModel.findByIdAndDelete({ _id });

		// return the result
		return res.send({ result });
	} catch (err) {
		next(err);
	}
}
