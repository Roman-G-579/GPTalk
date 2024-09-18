import { NextFunction, Request, Response } from 'express';
import { ResultModel } from '../models/result.interface';
import { PipelineStage } from 'mongoose';

/**
 * Fetches and sorts users in the database by their total experience points (exp) 
 * in the given language, and returns the top users.
 * 
 * @param req - The HTTP request object, including the language in the request header.
 * @param res - The HTTP response object used to send the top users data.
 * @param next - The next middleware function in the Express pipeline.
 * @returns Returns the top 3 users and users ranked 4-10, sorted by total experience.
 */
export async function getTopUsers(req: Request, res: Response, next: NextFunction) {
	try {
		let language = req.header('language'); // Get the language from the request header

		// If no language is provided, return an error
		if (!language) {
			return res.status(400).send({ error: 'Error reading language from request' });
		}

		// Initialize the aggregation pipeline for MongoDB query
		const aggregationPipeline: PipelineStage[] = [];

		// Filter by language if the language is selected (excluding NOT_SELECTED)
		if (language !== 'NOT_SELECTED') {
			aggregationPipeline.push({
				$match: { language: language }, // Filter documents based on the selected language
			});
		}

		// Group by user and calculate the total experience (exp)
		aggregationPipeline.push(
			{
				$group: {
					_id: '$user', // Group by user ID
					totalExp: { $sum: '$exp' }, // Sum the experience points for each user
				},
			},
			{
				$lookup: {
					from: 'users', // Join with the 'users' collection to get user details
					localField: '_id',
					foreignField: '_id',
					as: 'user', // Alias the result as 'user'
				},
			},
			{
				$unwind: '$user', // Deconstruct the array of users into individual documents
			},
			{
				$project: {
					_id: 0, // Exclude the _id field from the result
					userId: '$_id', // Include the user ID
					username: '$user.username', // Include the username
					firstName: '$user.firstName', // Include the first name
					lastName: '$user.lastName', // Include the last name
					createdAt: '$user.createdAt', // Include the user creation date
					totalExp: 1, // Include the total experience points
				},
			},
			{
				$sort: { totalExp: -1 }, // Sort users by total experience in descending order
			},
		);

		// Execute the aggregation query
		const userExp: Object[] = await ResultModel.aggregate(aggregationPipeline);

		// Get the top 3 users and users ranked 4-10
		const top3Users = getTop3Users(userExp);
		const top4To10Users = getTop4To10Users(userExp);

		// Return the top users data in the response
		return res.send({ top3Users, top4To10Users });
	} catch (err) {
		next(err); // Pass any error to the error-handling middleware
	}
}

/**
 * Retrieves the top 3 users from the user experience array.
 * If there are fewer than 3 users, null values are added to fill the array.
 * 
 * @param userExp - The array of user experience data.
 * @returns Returns an array of the top 3 users or null if fewer users are available.
 */
function getTop3Users(userExp: Object[]) {
	const top3Users = userExp.slice(0, 3); // Get the first 3 users

	// If there are fewer than 3 users, add null values to the array
	while (top3Users.length < 3) {
		top3Users.push(null);
	}

	return top3Users;
}

/**
 * Retrieves users ranked 4th to 10th from the user experience array.
 * If there are fewer than 7 users in this range, null values are added to fill the array.
 * 
 * @param userExp - The array of user experience data.
 * @returns Returns an array of users ranked 4th to 10th or null if fewer users are available.
 */
function getTop4To10Users(userExp: Object[]) {
	const top4To10Users = userExp.slice(3, 10); // Get users ranked 4th to 10th

	// If there are fewer than 7 users in this range, add null values to the array
	while (top4To10Users.length < 7) {
		top4To10Users.push(null);
	}

	return top4To10Users;
}
