import OpenAI from 'openai';
import { Request, Response, NextFunction } from 'express';
import { Config } from '../config/config';
import httpStatus from 'http-status';

const openai = new OpenAI({ apiKey: Config.OPENAI_API_KEY });

/**
 * Sends a chat completion request to the OpenAI API using the given parameters
 */
export async function generateLessonMiddleware(req: Request, res: Response, next: NextFunction) {
	try {
		const { userPrompt } = req.body;
		const completion = await openai.chat.completions.create({
			messages: [
				{
					role: 'system',
					content:
						'you are a helpful language learning exercise generator, please output valid JSON. include every key from the instruction in the response object ',
				},
				{ role: 'user', content: userPrompt },
			],
			model: 'gpt-4o-mini',
			response_format: { type: 'json_object' },
			temperature: 0.3,
		});

		return res.status(httpStatus.OK).send(completion.choices[0].message.content);
	} catch (err) {
		next(err);
	}
}
