import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import HttpStatus from 'http-status';
import { loginMiddleware } from '../../controllers/auth.controller';
import { UserModel } from '../../models/user.interface';
import { calculateTotalExp } from '../../controllers/user-profile.controller';

jest.mock('bcrypt');
jest.mock('jsonwebtoken');
jest.mock('../../models/user.interface');
jest.mock('../../controllers/user-profile.controller');

describe('loginMiddleware', () => {
	let req: Partial<Request>;
	let res: Partial<Response>;
	let next: NextFunction;

	beforeEach(() => {
		req = {
			body: {}
		};
		res = {
			status: jest.fn().mockReturnThis(),
			json: jest.fn(),
		};
		next = jest.fn();
	});

	it('should return 400 if email or password is missing', async () => {
		req.body = {};

		await loginMiddleware(req as Request, res as Response, next);

		expect(res.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
		expect(res.json).toHaveBeenCalledWith({ message: 'Email and password are required' });
	});

	it('should return 401 if the user does not exist', async () => {
		req.body = { email: 'test@test.com', password: 'password' };
		(UserModel.findOne as jest.Mock).mockResolvedValue(null);

		await loginMiddleware(req as Request, res as Response, next);

		expect(res.status).toHaveBeenCalledWith(HttpStatus.UNAUTHORIZED);
		expect(res.json).toHaveBeenCalledWith({ message: 'Invalid email or password' });
	});

	it('should return 401 if the password is incorrect', async () => {
		req.body = { email: 'test@test.com', password: 'password' };
		const mockUser = { email: 'test@test.com', password: 'hashedpassword' };
		(UserModel.findOne as jest.Mock).mockResolvedValue(mockUser);
		(bcrypt.compare as jest.Mock).mockResolvedValue(false);

		await loginMiddleware(req as Request, res as Response, next);

		expect(res.status).toHaveBeenCalledWith(HttpStatus.UNAUTHORIZED);
		expect(res.json).toHaveBeenCalledWith({ message: 'Invalid email or password' });
	});

	it('should return a token and user if login is successful', async () => {
		req.body = { email: 'test@test.com', password: 'password' };
		const mockUser = { email: 'test@test.com', password: 'hashedpassword', _id: '12345' };
		(UserModel.findOne as jest.Mock).mockResolvedValue(mockUser);
		(bcrypt.compare as jest.Mock).mockResolvedValue(true);
		(jwt.sign as jest.Mock).mockReturnValue('mockToken');
		(calculateTotalExp as jest.Mock).mockResolvedValue(100);

		await loginMiddleware(req as Request, res as Response, next);

		expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
		expect(res.json).toHaveBeenCalledWith({
			token: 'mockToken',
			user: { ...mockUser, password: undefined, totalExp: 100 },
		});
	});
});
