import { Request, Response, NextFunction } from 'express';
import OpenAi from 'openai';
import { Config } from '../config/config';
import httpStatus from 'http-status';

const openai = new OpenAi({ apiKey: Config.OPENAI_API_KEY });

export async function chatWithMeMiddleware(req: Request, res: Response, next: NextFunction) {
	try {
		const { userPrompt, language, conversation } = req.body;
		const prompt = [
			{ role: 'system', content: `You are a language tutor for ${language}.` },
			...conversation,
			{ role: 'user', content: userPrompt },
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
					"Please provide a grade from 1 to 5 for the user's overall performance and assign experience points accordingly.",
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
