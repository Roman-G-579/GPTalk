import { Request, Response, NextFunction } from 'express';
import OpenAi from 'openai';
import { Config } from '../config/config';
import httpStatus from 'http-status';
import { User } from '../models/user.interface';
import { ResultModel } from '../models/result.interface';
import { LanguageEnum } from '../models/enums/language.enum';

const openai = new OpenAi({ apiKey: Config.OPENAI_API_KEY }); // Initialize OpenAI client with API key

/**
 * Middleware to handle chat interactions between the user and the AI language tutor.
 * The user provides a prompt, and the AI responds based on the selected language.
 *
 * @param req - The HTTP request object containing the user prompt, selected language, and conversation history.
 * @param res - The HTTP response object used to send the AI's response.
 * @param next - The next middleware function in the Express pipeline.
 * @returns Returns the AI-generated response in the given language with feedback and follow-up question.
 */
export async function chatWithMeMiddleware(req: Request, res: Response, next: NextFunction) {
	try {
		const { userPrompt, language, conversation } = req.body;

		// Construct the content for the AI, asking for feedback in JSON format
		const content = `Return a JSON in the following structure { feedback: string, followUpQuestion: string } for the following user response: ${userPrompt}`;

		// Build the conversation prompt, including the conversation history and system instructions
		const prompt = [
			{ role: 'system', content: `You are a language tutor for ${language}.` },
			...conversation,
			{ role: 'user', content },
			{
				role: 'system',
				content: `Engage in a conversation with the user in ${language}. Correct their mistakes and provide explanations or comments about their responses when needed. Only ask a question in every third response. Aim to have a balanced dialogue, alternating between questions and statements or feedback.`,
			},
		];

		// Generate a completion from the OpenAI model using the prompt
		const completion = await openai.chat.completions.create({
			messages: prompt,
			model: 'gpt-4o',
			response_format: { type: 'json_object' },
			temperature: 0.3, // Set the temperature to control randomness
		});

		// Send the AI's response back to the client
		return res.status(httpStatus.OK).send(completion.choices[0].message.content);
	} catch (err) {
		next(err); // Pass errors to the error-handling middleware
	}
}

/**
 * Middleware to grade a chat conversation between the user and the AI language tutor.
 * The AI grades the user's performance based on their responses and provides feedback.
 *
 * @param req - The HTTP request object containing the conversation history and selected language.
 * @param res - The HTTP response object used to send the grading result.
 * @param next - The next middleware function in the Express pipeline.
 * @returns Returns the grade and feedback along with the calculated experience reward.
 */
export async function gradeChatMiddleware(req: Request, res: Response, next: NextFunction) {
	try {
		const { conversation, language } = req.body;

		// Calculate the length of the conversation (number of exchanged messages)
		const conversationLength = conversation.length;

		// Build the prompt for grading the conversation
		const prompt = [
			{ role: 'system', content: `You are a language tutor for ${language}.` },
			...conversation,
			{
				role: 'system',
				content: `Return a JSON in the following structure { grade: number, feedback: grade_explanation } where 1 <= grade <= 100 for the ${language} grammar of the user's messages. grade_explanation is your reasoning for the grade, only base it on user's messages. Write the feedback in English.`,
			},
		];

		// Generate a completion from the OpenAI model for grading
		const completion = await openai.chat.completions.create({
			messages: prompt,
			model: 'gpt-4o',
			response_format: { type: 'json_object' },
			temperature: 0.3, // Set temperature for stable responses
		});

		// Parse the JSON response from the AI into a grade object
		let gradeObj = JSON.parse(completion.choices[0].message.content);

		// Calculate the experience reward based on the grade and conversation length
		const expReward = calculateSessionExp(gradeObj.grade as number, conversationLength);
		gradeObj.expReward = expReward;

		// Save the result to the database
		await saveToDb(expReward, req.user, language);

		// Send the grade and feedback back to the client
		return res.status(httpStatus.OK).send(gradeObj);
	} catch (err) {
		next(err); // Pass errors to the error-handling middleware
	}
}

/**
 * Saves the result of a conversation (including experience points) to the database.
 *
 * @param expReward - The experience points earned from the conversation.
 * @param user - The user object (includes user ID).
 * @param language - The language in which the conversation took place.
 * @returns Returns a promise resolving to the saved result document.
 */
async function saveToDb(expReward: number, user: User, language: LanguageEnum) {
	const obj = {
		exp: expReward, // Experience points earned
		user: user._id.toString(), // User ID
		language, // Language of the conversation
	};
	return await ResultModel.create(obj); // Create a new result document in the database
}

/**
 * Calculates the session experience points (exp) based on the length of the conversation.
 * The longer the conversation, the larger the experience bonus.
 *
 * @param grade - The grade value given by the chatbot (1 to 100).
 * @param convLen - The length of the conversation (number of exchanged messages).
 * @returns Returns the calculated experience points for the session.
 */
function calculateSessionExp(grade: number, convLen: number): number {
	if (convLen >= 30) {
		return grade * 5; // Large bonus for longer conversations
	} else if (convLen >= 20 && convLen < 30) {
		return Math.round(grade * 3.5); // Moderate bonus
	} else if (convLen >= 10 && convLen < 20) {
		return grade * 2; // Smaller bonus for medium-length conversations
	}
	return Math.round(grade * 1.5); // Minimal bonus for short conversations
}
