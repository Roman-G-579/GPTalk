import { Request, Response, NextFunction } from 'express';
import httpStatus from 'http-status';
import { UserModel } from '../../models/user.interface';
import { ResultModel } from '../../models/result.interface';
import { ChallengeModel } from '../../models/challenge.interface';
import {
	getUserProfile,
	postResult,
	calculateTotalExp,
	calculateMaxStreak,
} from '../../controllers/user-profile.controller';
import { Types, Schema } from 'mongoose';

jest.mock('../../controllers/user-profile.controller', () =>
	jest.requireActual('../../controllers/user-profile.controller'),
);
jest.mock('../../models/user.interface');
jest.mock('../../models/result.interface');
jest.mock('../../models/challenge.interface');
jest.mock('../../models/visit-log.interface');
jest.mock('../../models/language.interface');
jest.mock('../../models/achievment.interface');
jest.mock('../../models/user.interface', () => ({
	UserModel: {
		findOne: jest.fn(),
	},
}));

describe('User Controller', () => {
	let req: Partial<Request>;
	let res: Partial<Response>;
	let next: NextFunction;

	const mockUserId = new Types.ObjectId() as unknown as Schema.Types.ObjectId; // Cast to Schema.Types.ObjectId

	beforeEach(() => {
		req = {};
		res = {
			status: jest.fn().mockReturnThis(),
			json: jest.fn(),
			send: jest.fn(),
		};
		next = jest.fn();
	});

	describe('getUserProfile', () => {
		beforeEach(() => {
			req.params = { email: 'test@example.com' };
			jest.clearAllMocks();
		});

		it('should return 404 if the user is not found', async () => {
			(UserModel.findOne as jest.Mock).mockResolvedValue(null);

			await getUserProfile(req as Request, res as Response, next);

			expect(res.status).toHaveBeenCalledWith(httpStatus.NOT_FOUND);
			expect(res.json).toHaveBeenCalledWith({ message: 'User not found' });
		});

		it('should return the user profile if the user is found', async () => {
			const mockUserId = new Types.ObjectId('111111111111111111111111').toString();
			const mockUser = {
				_id: mockUserId,
				email: 'test@example.com',
				toObject: jest.fn().mockReturnValue({ email: 'test@example.com' }),
			};

			(UserModel.findOne as jest.Mock).mockResolvedValue(mockUser);

			await getUserProfile(req as Request, res as Response, next);

			expect(UserModel.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
		});
	});

	describe('postResult', () => {
		it('should return 404 if the user is not found', async () => {
			req.body = { email: 'test@example.com', exp: 50, numberOfQuestions: 10, mistakes: 1 };
			(UserModel.findOne as jest.Mock).mockResolvedValue(null);

			await postResult(req as Request, res as Response, next);

			expect(res.status).toHaveBeenCalledWith(httpStatus.NOT_FOUND);
			expect(res.json).toHaveBeenCalledWith({ message: 'User not found' });
		});

		it('should create and save a result and challenge', async () => {
			const mockUser = { _id: mockUserId };
			req.body = { email: 'test@example.com', exp: 50, numberOfQuestions: 10, mistakes: 1 };
			(UserModel.findOne as jest.Mock).mockResolvedValue(mockUser);

			const mockResult = { _id: 'resultId' };
			(ResultModel.prototype.save as jest.Mock).mockResolvedValue(mockResult);
			(ChallengeModel.prototype.save as jest.Mock).mockResolvedValue(true);

			await postResult(req as Request, res as Response, next);

			expect(ResultModel.prototype.save).toHaveBeenCalled();
			expect(ChallengeModel.prototype.save).toHaveBeenCalled();
			expect(res.status).toHaveBeenCalledWith(httpStatus.OK);
			expect(res.json).toHaveBeenCalledWith(mockResult);
		});
	});

	describe('Utility Functions', () => {
		describe('calculateTotalExp', () => {
			it('should return the total experience for a user', async () => {
				const mockResults = [{ exp: 10 }, { exp: 20 }, { exp: 30 }];
				(ResultModel.find as jest.Mock).mockResolvedValue(mockResults);

				const totalExp = await calculateTotalExp(mockUserId);

				expect(totalExp).toBe(60);
			});

			it('should return 0 if there are no results', async () => {
				(ResultModel.find as jest.Mock).mockResolvedValue([]);

				const totalExp = await calculateTotalExp(mockUserId);

				expect(totalExp).toBe(0);
			});

			it('should throw an error if the query fails', async () => {
				const error = new Error('Database error');
				(ResultModel.find as jest.Mock).mockRejectedValue(error);

				await expect(calculateTotalExp(mockUserId)).rejects.toThrow('Database error');
			});
		});

		describe('calculateMaxStreak', () => {
			it('should return the current max streak if the current streak is not greater', async () => {
				const mockUser = { _id: mockUserId, maxStreak: 10 };
				(UserModel.findOne as jest.Mock).mockResolvedValue(mockUser);

				const maxStreak = await calculateMaxStreak(mockUserId, 5);

				expect(maxStreak).toBe(10);
			});

			it('should throw an error if the query fails', async () => {
				const error = new Error('Database error');
				(UserModel.findOne as jest.Mock).mockRejectedValue(error);

				await expect(calculateMaxStreak(mockUserId, 10)).rejects.toThrow('Database error');
			});
		});
	});
});
