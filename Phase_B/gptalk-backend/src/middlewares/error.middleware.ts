import { ErrorRequestHandler } from 'express';
import { CustomError } from '../models/custom-error.model';

export const errorMiddleware: ErrorRequestHandler = (
	error: TypeError | CustomError,
	req,
	res,
	next,
) => {
	let err = error;
	if (!(error instanceof CustomError)) {
		err = new CustomError(error.message);
	}
	res
		.status((err as CustomError).status)
		.send({ status: (err as CustomError).status, message: err.message });
};
