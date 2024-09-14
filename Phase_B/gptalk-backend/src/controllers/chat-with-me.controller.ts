import { Request, Response, NextFunction } from 'express';
import OpenAi from 'openai';
import { Config } from '../config/config';
import httpStatus from 'http-status';
import { User } from '../models/user.interface';
import { ResultModel } from '../models/result.interface';
import { LanguageEnum } from '../models/enums/language.enum';

const openai = new OpenAi({ apiKey: Config.OPENAI_API_KEY });

export async function chatWithMeMiddleware(req: Request, res: Response, next: NextFunction) {
	try {
		const { userPrompt, language, conversation } = req.body;
		const content = `Return a JSON in the following structure { feedback: string, followUpQuestion: string } for the following user response: ${userPrompt}`;
		const prompt = [
			{ role: 'system', content: `You are a language tutor for ${language}.` },
			...conversation,
			{ role: 'user', content },
			{
				role: 'system',
				content: `Engage in a conversation with the user in ${language}. Correct their mistakes and provide explanations or comments about their responses when needed, but do not ask a question in every response. Aim to have a balanced dialogue, alternating between questions and statements or feedback.`,
			},
		];
		const completion = await openai.chat.completions.create({
			messages: prompt,
			model: 'gpt-4o',
			response_format: { type: 'json_object' },
			temperature: 0.3,
		});

		return res.status(httpStatus.OK).send(completion.choices[0].message.content);
	} catch (err) {
		next(err);
	}
}

export async function gradeChatMiddleware(req: Request, res: Response, next: NextFunction) {
	try {
		const { conversation, language } = req.body;

		// The length of the entire conversation between the user and the chatbot
		const conversationLength = conversation.length;

		const prompt = [
			{ role: 'system', content: `You are a language tutor for ${language}.` },
			...conversation,
			{
				role: 'system',
				content: `Return a JSON in the following structure { grade: number feedback: grade_explanation } where 1 <= grade <= 100 for the ${language} grammar of the user's messages. grade_explanation is your reasoning for the grade, only base it on user's messages. Write the feedback in English.`,
			},
		];

		const completion = await openai.chat.completions.create({
			messages: prompt,
			model: 'gpt-4o',
			response_format: { type: 'json_object' },
			temperature: 0.3,
		});

		let gradeObj = JSON.parse(completion.choices[0].message.content);

		// Calculates the final exp reward based on the given grade and conversation length
		const expReward = calculateSessionExp(gradeObj.grade as number, conversationLength);
		gradeObj.expReward = expReward;

		await saveToDb(expReward, req.user, language);

		return res.status(httpStatus.OK).send(gradeObj);
	} catch (err) {
		next(err);
	}
}

async function saveToDb(expReward: number, user: User, language: LanguageEnum) {
	const obj = {
		exp: expReward,
		user: user._id.toString(),
		language,
	};
	return await ResultModel.create(obj);
}

/**
 * Calculates the session exp based on the length of the conversation
 * The longer the conversation, the larger the exp bonus
 * @param grade the grade value given by the chatbot
 * @param convLen the length of the conversation based on the number of exchanged messages
 */
function calculateSessionExp(grade: number, convLen: number): number {
	if (convLen >= 30) {
		return grade * 5;
	} else if (convLen >= 20 && convLen < 30) {
		return Math.round(grade * 3.5);
	} else if (convLen >= 10 && convLen < 20) {
		return grade * 2;
	}
	return Math.round(grade * 1.5);
}
