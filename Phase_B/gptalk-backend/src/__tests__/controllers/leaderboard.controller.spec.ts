import { Request, Response, NextFunction } from 'express';
import { getTopUsers } from '../../controllers/leaderboard.controller';
import { ResultModel } from '../../models/result.interface';

jest.mock('../../models/result.interface');

describe('getTopUsers', () => {
	let req: Partial<Request>;
	let res: Partial<Response>;
	let next: NextFunction;

	beforeEach(() => {
		req = {
			header: jest.fn(),
		};
		res = {
			send: jest.fn(),
			status: jest.fn().mockReturnThis(),
		};
		next = jest.fn();

		(ResultModel.aggregate as jest.Mock).mockResolvedValue([]);
	});

	it('should return top 3 and top 4 to 10 users when data is available and language is NOT_SELECTED', async () => {
		req.header = jest.fn().mockReturnValue('NOT_SELECTED');

		const mockData = [
			{
				userId: '1',
				username: 'User1',
				firstName: 'First1',
				lastName: 'Last1',
				createdAt: new Date(),
				totalExp: 100,
			},
			{
				userId: '2',
				username: 'User2',
				firstName: 'First2',
				lastName: 'Last2',
				createdAt: new Date(),
				totalExp: 90,
			},
			{
				userId: '3',
				username: 'User3',
				firstName: 'First3',
				lastName: 'Last3',
				createdAt: new Date(),
				totalExp: 80,
			},
			{
				userId: '4',
				username: 'User4',
				firstName: 'First4',
				lastName: 'Last4',
				createdAt: new Date(),
				totalExp: 70,
			},
			{
				userId: '5',
				username: 'User5',
				firstName: 'First5',
				lastName: 'Last5',
				createdAt: new Date(),
				totalExp: 60,
			},
			{
				userId: '6',
				username: 'User6',
				firstName: 'First6',
				lastName: 'Last6',
				createdAt: new Date(),
				totalExp: 50,
			},
			{
				userId: '7',
				username: 'User7',
				firstName: 'First7',
				lastName: 'Last7',
				createdAt: new Date(),
				totalExp: 40,
			},
		];

		(ResultModel.aggregate as jest.Mock).mockResolvedValue(mockData);

		await getTopUsers(req as Request, res as Response, next);

		expect(ResultModel.aggregate).toHaveBeenCalledWith([
			{
				$group: {
					_id: '$user',
					totalExp: { $sum: '$exp' },
				},
			},
			{
				$lookup: {
					from: 'users',
					localField: '_id',
					foreignField: '_id',
					as: 'user',
				},
			},
			{
				$unwind: '$user',
			},
			{
				$project: {
					_id: 0,
					userId: '$_id',
					username: '$user.username',
					firstName: '$user.firstName',
					lastName: '$user.lastName',
					createdAt: '$user.createdAt',
					totalExp: 1,
				},
			},
			{
				$sort: { totalExp: -1 },
			},
		]);

		expect(res.send).toHaveBeenCalledWith({
			top3Users: mockData.slice(0, 3),
			top4To10Users: [...mockData.slice(3, 10), null, null, null],
		});
	});

	it('should return top 3 and top 4 to 10 users when data is available and a specific language is provided', async () => {
		const language = 'JavaScript';
		req.header = jest.fn().mockReturnValue(language);

		const mockData = [
			{
				userId: '1',
				username: 'User1',
				firstName: 'First1',
				lastName: 'Last1',
				createdAt: new Date(),
				totalExp: 100,
			},
			{
				userId: '2',
				username: 'User2',
				firstName: 'First2',
				lastName: 'Last2',
				createdAt: new Date(),
				totalExp: 90,
			},
			{
				userId: '3',
				username: 'User3',
				firstName: 'First3',
				lastName: 'Last3',
				createdAt: new Date(),
				totalExp: 80,
			},
			{
				userId: '4',
				username: 'User4',
				firstName: 'First4',
				lastName: 'Last4',
				createdAt: new Date(),
				totalExp: 70,
			},
			{
				userId: '5',
				username: 'User5',
				firstName: 'First5',
				lastName: 'Last5',
				createdAt: new Date(),
				totalExp: 60,
			},
			{
				userId: '6',
				username: 'User6',
				firstName: 'First6',
				lastName: 'Last6',
				createdAt: new Date(),
				totalExp: 50,
			},
			{
				userId: '7',
				username: 'User7',
				firstName: 'First7',
				lastName: 'Last7',
				createdAt: new Date(),
				totalExp: 40,
			},
		];

		(ResultModel.aggregate as jest.Mock).mockResolvedValue(mockData);

		await getTopUsers(req as Request, res as Response, next);

		expect(ResultModel.aggregate).toHaveBeenCalledWith([
			{
				$match: { language: language },
			},
			{
				$group: {
					_id: '$user',
					totalExp: { $sum: '$exp' },
				},
			},
			{
				$lookup: {
					from: 'users',
					localField: '_id',
					foreignField: '_id',
					as: 'user',
				},
			},
			{
				$unwind: '$user',
			},
			{
				$project: {
					_id: 0,
					userId: '$_id',
					username: '$user.username',
					firstName: '$user.firstName',
					lastName: '$user.lastName',
					createdAt: '$user.createdAt',
					totalExp: 1,
				},
			},
			{
				$sort: { totalExp: -1 },
			},
		]);

		expect(res.send).toHaveBeenCalledWith({
			top3Users: mockData.slice(0, 3),
			top4To10Users: [...mockData.slice(3, 10), null, null, null],
		});
	});

	it('should return a 400 error if language header is missing', async () => {
		req.header = jest.fn().mockReturnValue(undefined);

		await getTopUsers(req as Request, res as Response, next);

		expect(res.status).toHaveBeenCalledWith(400);
		expect(res.send).toHaveBeenCalledWith({ error: 'Error reading language from request' });
	});

	it('should return null-filled arrays if there are less than 3 or 7 users', async () => {
		req.header = jest.fn().mockReturnValue('NOT_SELECTED');

		const mockData = [
			{
				userId: '1',
				username: 'User1',
				firstName: 'First1',
				lastName: 'Last1',
				createdAt: new Date(),
				totalExp: 100,
			},
		];

		(ResultModel.aggregate as jest.Mock).mockResolvedValue(mockData);

		await getTopUsers(req as Request, res as Response, next);

		expect(res.send).toHaveBeenCalledWith({
			top3Users: [...mockData, null, null],
			top4To10Users: Array(7).fill(null),
		});
	});

	it('should call next with an error if aggregation fails', async () => {
		req.header = jest.fn().mockReturnValue('NOT_SELECTED');

		const error = new Error('Aggregation failed');
		(ResultModel.aggregate as jest.Mock).mockRejectedValue(error);

		await getTopUsers(req as Request, res as Response, next);

		expect(next).toHaveBeenCalledWith(error);
	});
});
