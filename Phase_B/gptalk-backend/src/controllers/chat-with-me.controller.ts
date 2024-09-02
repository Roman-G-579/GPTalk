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
				content: "Provide feedback on the user's response, then ask a follow-up question.",
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
		const prompt = [
			{ role: 'system', content: `You are a language tutor for ${language}.` },
			...conversation,
			{
				role: 'system',
				content:
					'Return a JSON in the following structure { grade: number } where 1 <= grade <= 100 for the latests conversation where 1 is the lowest grade and 100 is the highest.',
			},
		];

		const completion = await openai.chat.completions.create({
			messages: prompt,
			model: 'gpt-4o',
			response_format: { type: 'json_object' },
			temperature: 0.3,
		});

		const gradeObj = JSON.parse(completion.choices[0].message.content);

		await saveToDb(gradeObj as unknown as { grade: number }, req.user, language);

		return res.status(httpStatus.OK).send(gradeObj);
	} catch (err) {
		next(err);
	}
}

async function saveToDb(gradeObj: { grade: number }, user: User, language: LanguageEnum) {
	const obj = {
		exp: gradeObj.grade,
		user: user._id.toString(),
		language,
	};
	return await ResultModel.create(obj);
}
