import { Request, Response, NextFunction } from 'express';
import { registerMiddleware } from '../../src/controllers/register.controller';
import { UserModel, Role } from '../../src/models/user.interface';

jest.mock('../../src/models/user.interface');
jest.mock('../../src/config/cache');

describe('Middleware Tests', () => {
	let req: Request;
	let res: Response;
	let next: jest.Mock<NextFunction>;

	jest.mock;

	beforeEach(() => {
		req = {} as Request;
		res = {} as Response;
		next = jest.fn();
	});

	afterEach(() => {
		jest.restoreAllMocks();
	});

	const createdUser = {
		username: 'test',
		email: 'test@test.spec',
		age: 20,
		role: Role.USER,
	};

	//TODO: change test to fit the registerMiddleware function

	// describe('addUserMiddleware', () => {
	// 	it('should create a user and return it', async () => {
	// 		// Arrange
	// 		req.body = {
	// 			username: 'test',
	// 			email: 'test@test.spec',
	// 			age: 20,
	// 			role: Role.USER,
	// 		};
	//
	// 		const createMock = jest.fn().mockResolvedValue(createdUser);
	// 		jest.spyOn(UserModel, 'create').mockImplementation(createMock);
	//
	// 		jest.spyOn(redisClient, 'setEx').mockResolvedValue('');
	//
	// 		// Act
	// 		await addUserMiddleware(req as Request, res as Response, next);
	//
	// 		// Assert
	// 		expect(UserModel.create).toHaveBeenCalledTimes(1);
	// 		expect(UserModel.create).toHaveBeenCalledWith({
	// 			username: 'test',
	// 			email: 'test@test.spec',
	// 			age: 20,
	// 			role: Role.USER,
	// 		});
	// 	});
	// });
});
