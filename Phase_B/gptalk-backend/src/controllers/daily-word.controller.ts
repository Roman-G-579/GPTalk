import OpenAI from 'openai';
import { Config } from '../config/config';
import { NextFunction, Request, Response } from 'express';
import httpStatus from 'http-status';
import { DailyWord, DailyWordModel } from '../models/daily-word.interface';
import { LanguageEnum } from '../models/enums/language.enum';
import {SYNTATIC_TERMS} from "../utils/syntaticTerms";
import {TOPICS} from "../utils/topics";

const openai = new OpenAI({ apiKey: Config.OPENAI_API_KEY});

/**
 * Fetches the daily word from the database, based on the given date
 * @param req contains the date and language parameters
 * @param res
 * @param next
 */
export async function fetchDailyWord(req: Request, res: Response, next: NextFunction) {
	try {
		const {date} = req.body;
		let dayStart = new Date(date); // The start date of the search filter

		// Validates that the received parameter is a valid Date
		if (isNaN(dayStart.getTime())) {
			return res.status(400).json({ message: 'Invalid date format' });
		}

		dayStart.setHours(0, 0, 0, 0);

		const dayEnd = new Date(dayStart); // The end date of the search filter
		dayEnd.setDate(dayStart.getDate() + 1);

		let result = await DailyWordModel.findOne({
			createdAt:{$gte:dayStart,$lt:dayEnd}
		});

		// If a word does not exist for the requested date and language,
		// a new word is retrieved from the API
		if (!result) {
			let generatedResult = await generateDailyWord();

			const postResult = await postDailyWord(generatedResult);

			if (!postResult) {
				return res.status(httpStatus.NOT_FOUND).json({ message: 'Daily word could not be generated' });
			}

			// Creates a formatted DailyWord object that will be returned to the frontend
			result = new DailyWordModel({
				word: generatedResult.word,
				language: generatedResult.language,
				definition: generatedResult.definition,
				example: generatedResult.example,
				translation: generatedResult.translation,
			});
		}
		return res.status(httpStatus.OK).send(result);
	} catch (err) {
		next(err);
	}
}

/**
 * Generates a daily word object using the OpenAI API
 */
async function generateDailyWord() {
	try {
		// Picks a random language to generate
		const languagesArr = Object.values(LanguageEnum);
		let randomIndex = Math.floor(Math.random() * languagesArr.length);
		const language = languagesArr[randomIndex];

		// Picks a random syntactic  term of the word
		randomIndex = Math.floor(Math.random() * SYNTATIC_TERMS.length);
		const syntacticTerm = SYNTATIC_TERMS[randomIndex];

		// Picks a random topic for the daily word
		randomIndex = Math.floor(Math.random() * TOPICS.length);
		const topic = TOPICS[randomIndex];

		const content = `Return a JSON in consisting of 4 keys: { 1. word: ${syntacticTerm} related to ${topic} in ${language}, followed by the word's transliteration, followed by syntactic term in english in brackets. 2.definition: definition in english 3.example: string in ${language} 4.translation: example translation to english}`;
		const completion = await openai.chat.completions.create({
			messages: [
				{ role: 'system', content: `You are a word-of-the-day generator.` },
				{ role: 'user', content }
			],
			model: "gpt-4o-mini",
			response_format: {"type": "json_object"},
			temperature: 0.3,
		});

		let result = JSON.parse(completion.choices[0].message.content);
		result.language = language; // Adds the word's language to the result object
		return result;
	} catch (err) {
		throw err;
	}
}

/**
 * Saves a daily word object to the database
 * @param wordData the daily word object that will be saved
 */
async function postDailyWord(wordData: DailyWord) {
	try {
		return await new DailyWordModel(wordData).save();
	} catch (err) {
		throw err;
	}
}
