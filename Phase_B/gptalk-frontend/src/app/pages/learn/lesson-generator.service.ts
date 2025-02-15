/* eslint-disable @typescript-eslint/no-unused-vars */
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Language } from '../../core/enums/language.enum';
import { Difficulty } from '../../core/enums/difficulty.enum';
import { Exercise } from '../../core/interfaces/exercise.interface';
import { LessonGeneratorUtils as genUtil } from './utils/lesson-generator.utils';
import { forkJoin, map, Observable } from 'rxjs';
import { ExerciseType } from '../../core/enums/exercise-type.enum';
import {
	CONVERSATION_STARTERS,
	REPLY_MISTAKE_TYPES,
	SUMMARY_MISTAKE_TYPES,
	TENSE_TYPES,
} from '../../core/utils/exerciseSpecificConsts';

@Injectable({
	providedIn: 'root',
})
export class LessonGeneratorService {
	private readonly apiUrl = environment.apiUrl;
	private readonly http = inject(HttpClient);

	/**
	 * Generates the specified amount of random exercises by calling OpenAI's API
	 *
	 * @param language the language of the generated exercise
	 * @param difficulty difficulty the difficulty level
	 * @param amount the amount of exercises to be generated
	 * @returns the exercises observable
	 */
	generateLesson(
		language: Language,
		difficulty: Difficulty,
		amount: number,
	): Observable<Exercise[]> {
		// Get a random topic to use in the exercise generation prompts
		let topic = genUtil.getRandomTopic();

		// All functions that can be called to generate an exercise
		const exerciseGenerators = [
			this.generateFillInTheBlank.bind(this),
			this.generateTranslateWord.bind(this),
			this.generateTranslateTheSentence.bind(this),
			this.generateCompleteTheConversation.bind(this),
			this.generateMatchTheWords.bind(this),
			this.generateReorderSentence.bind(this),
			this.generateMatchTheCategory.bind(this),
			this.generateSummarizeTheParagraph.bind(this),
			this.generateChooseTheTense.bind(this),
		];

		// Stores the observables returned by the exercise generators
		const exerciseObservables: Observable<Exercise>[] = [];

		for (let i = 0; i < amount; i++) {
			// Choose a random exercise index
			const randomIndex: number = Math.floor(Math.random() * exerciseGenerators.length);

			// The Chosen function
			const generatorFunc = exerciseGenerators[randomIndex];

			// Generate an exercise prompt based on the randomized exercise index
			const exercisePrompt = generatorFunc(language, difficulty, topic);

			// Get JSON object from API and convert it to an Exercise object
			const exerciseObservable = this.getExerciseFromApi(exercisePrompt).pipe(
				map((response) => {
					//console.log(response)
					const exerciseType = <ExerciseType>randomIndex; // Sets the generated exercise's type
					return genUtil.convertToExerciseObject(response as Exercise, exerciseType);
				}),
			);

			// Add the exercise to the observables array
			exerciseObservables.push(exerciseObservable);

			topic = genUtil.getRandomTopic(); // Randomizes a different topic for the next exercise
		}

		return forkJoin(exerciseObservables);
	}

	/**
	 * Creates a query for the API to generate a "fill in the blanks" exercise, using the given parameters
	 * @param language the language of the generated exercise
	 * @param difficulty the exercise's difficulty level
	 * @param topic a topic that is included in the prompt to improve result diversity
	 */
	generateFillInTheBlank(language: Language, difficulty: Difficulty, topic: string): string {
		let numOfAnswers: number;

		// If the lesson's language is English, the sentence to complete will be in English.
		// Otherwise, the sentence is in the lesson's language
		const translationLanguage = language == Language.English ? Language.Hebrew : Language.English;

		// Parameters for novice difficulty
		if (difficulty == Difficulty.Novice) {
			numOfAnswers = 3;
		}
		// Parameters for advanced difficulty
		else if (difficulty == Difficulty.Advanced) {
			numOfAnswers = 4;
		}
		// Parameters for master difficulty
		else {
			numOfAnswers = 5;
		}

		return `generate an object in ${language}, ${Difficulty[difficulty]} difficulty. 'answer' is the sentence, 'translation' is its ${translationLanguage} translation, 'choices' is ${numOfAnswers} random words. Every word in 'choices' must not fit the sentence in 'answer'. Focus on topic: ${topic}. {"answer": "", "choices:" [], "translation": ""}`;
	}

	/**
	 * Creates a query for the API to generate a "translate words" exercise, using the given parameters
	 * @param language the language of the generated exercise
	 * @param difficulty the exercise's difficulty level
	 * @param topic a topic that is included in the prompt to improve result diversity
	 */
	generateTranslateWord(language: Language, difficulty: Difficulty, topic: string): string {
		let numOfAnswers: number;

		// If the lesson's language is English, the word is to be translated from Hebrew to English.
		// Otherwise, the word is to be translated from English to the lesson's language
		const wordLanguage = language == Language.English ? Language.Hebrew : Language.English;
		const translationLanguage = wordLanguage == Language.Hebrew ? Language.English : language;

		// Parameters for novice difficulty
		if (difficulty == Difficulty.Novice) {
			numOfAnswers = 3;
		}
		// Parameters for advanced difficulty
		else if (difficulty == Difficulty.Advanced) {
			numOfAnswers = 4;
		}
		// Parameters for master difficulty
		else {
			numOfAnswers = 5;
		}

		return `generate word array, difficulty: ${Difficulty[difficulty]}, language: ${wordLanguage}. number of words: ${numOfAnswers}. Focus on topic: ${topic}. {"choices": [array_of_words] "translations": [array_of_${translationLanguage}_translations] }`;
	}

	/**
	 * Creates a query for the API to generate a "write the sentence in the specified language" exercise, using the given parameters
	 * @param language the language of the generated exercise
	 * @param difficulty the exercise's difficulty level
	 * @param topic a topic that is included in the prompt to improve result diversity
	 */
	generateTranslateTheSentence(language: Language, difficulty: Difficulty, topic: string): string {
		// If the lesson's language is English, the sentence is to be translated from Hebrew to English.
		// Otherwise, the sentence is to be translated from English to the lesson's language
		const sentenceLanguage = language == Language.English ? Language.Hebrew : Language.English;
		const translationLanguage = sentenceLanguage == Language.Hebrew ? Language.English : language;

		return `generate a "translate the sentence" exercise, difficulty: ${Difficulty[difficulty]}. Focus on topic: ${topic}. {"question": "${sentenceLanguage} sentence", "answer": "${translationLanguage}_translation"}`;
	}

	/**
	 * Creates a query for the API to generate a "complete the conversation" exercise, using the given parameters
	 * @param language the language of the generated exercise
	 * @param difficulty the exercise's difficulty level
	 * @param topic a topic that is included in the prompt to improve result diversity
	 */
	generateCompleteTheConversation(
		language: Language,
		difficulty: Difficulty,
		topic: string,
	): string {
		let replyLengthLimit: number; // Limits the length of the reply options based on difficulty

		// If the lesson's language is English, the conversation is in English.
		// Otherwise, the conversation is in the lesson's language
		const conversationLanguage = language;
		const translationLanguage =
			conversationLanguage == Language.English ? Language.Hebrew : Language.English;

		// Sets random conversation starter type and random mistake type for one of the replies
		let randomIndex: number = Math.floor(Math.random() * CONVERSATION_STARTERS.length);
		const conversationStarter = CONVERSATION_STARTERS[randomIndex];

		randomIndex = Math.floor(Math.random() * REPLY_MISTAKE_TYPES.length);
		const mistakeType = REPLY_MISTAKE_TYPES[randomIndex];

		// Parameters for novice difficulty
		if (difficulty == Difficulty.Novice) {
			replyLengthLimit = 6;
		}
		// Parameters for advanced difficulty
		else if (difficulty == Difficulty.Advanced) {
			replyLengthLimit = 8;
		}
		// Parameters for master difficulty
		else {
			replyLengthLimit = 10;
		}

		return `generate object of strings in ${conversationLanguage}. All sentences of ${Difficulty[difficulty]} difficulty. reply1 is a grammatically and logically correct reply, reply2 contains ${mistakeType} error (replies have ${replyLengthLimit} words or less). Focus on topic: ${topic}. { "prompt": ${conversationStarter}, "choices": [reply1,reply2] "translation": prompt_&_correct_reply_in_${translationLanguage} }`;
	}

	/**
	 * Creates a query for the API to generate a "match the words to their translations" exercise, using the given parameters
	 * @param language the language of the generated exercise
	 * @param difficulty the exercise's difficulty level
	 * @param topic a topic that is included in the prompt to improve result diversity
	 */
	generateMatchTheWords(language: Language, difficulty: Difficulty, topic: string): string {
		// Exercise-specific parameters
		let numOfPairs: number;

		// If the lesson's language is English, the second word in each pair is in Hebrew
		// Otherwise, the second word in the pair is in English
		const secondWordLanguage = language == Language.English ? Language.Hebrew : Language.English;

		// Parameters for novice difficulty
		if (difficulty == Difficulty.Novice) {
			numOfPairs = 4;
		}
		// Parameters for advanced difficulty
		else if (difficulty == Difficulty.Advanced) {
			numOfPairs = 5;
		}
		// Parameters for master difficulty
		else {
			numOfPairs = 6;
		}

		return `Generate an array of word pairs in ${language}, ${Difficulty[difficulty]} difficulty. ${numOfPairs} pairs. Make sure there are no repeat words. Focus on topic: ${topic}. Follow this json structure: "correctPairs": { ["word","${secondWordLanguage}_translation"] }`;
	}

	/**
	 * Creates a query for the API to generate a "reorder the words into a proper sentence" exercise, using the given parameters
	 * @param language the language of the generated exercise
	 * @param difficulty the exercise's difficulty level
	 * @param topic a topic that is included in the prompt to improve result diversity
	 */
	generateReorderSentence(language: Language, difficulty: Difficulty, topic: string): string {
		let sentenceLength: number;

		// If the lesson's language is English, the translation is to Hebrew.
		// Otherwise, the translation is to  English
		const translationLanguage = language == Language.English ? Language.Hebrew : Language.English;

		// Parameters for novice difficulty
		if (difficulty == Difficulty.Novice) {
			sentenceLength = 4;
		}
		// Parameters for advanced difficulty
		else if (difficulty == Difficulty.Advanced) {
			sentenceLength = 5;
		}
		// Parameters for master difficulty
		else {
			sentenceLength = 6;
		}

		return `generate a ${sentenceLength} words long sentence (no repeating words), in ${language}, ${Difficulty[difficulty]} difficulty. Focus on topic: ${topic} { "answer": "", "translation": "${translationLanguage}_translation" }`;
	}

	/**
	 * Creates a query for the API to generate a "match the words to their categories" exercise, using the given parameters
	 * @param language the language of the generated exercise
	 * @param difficulty the exercise's difficulty level
	 * @param topic a topic that is included in the prompt to improve result diversity
	 */
	generateMatchTheCategory(language: Language, difficulty: Difficulty, topic: string): string {
		return `Generate 2 distinct categories and 4 words for each, in ${language}, ${Difficulty[difficulty]} difficulty. Focus on topic: ${topic}. The 2 categories must be different from each other in sch a way that each word only belongs to one of them. Ensure the response is strictly in the following JSON format: { "cat_a": "", "cat_b": "", "words_a": [], "words_b": [] }. Do not include any additional keys.`;
	}

	/**
	 * Creates a query for the API to generate a "summarize the paragraph" exercise, using the given parameters
	 * @param language the language of the generated exercise
	 * @param difficulty the exercise's difficulty level
	 * @param topic a topic that is included in the prompt to improve result diversity
	 */
	generateSummarizeTheParagraph(language: Language, difficulty: Difficulty, topic: string): string {
		let paragraphLengthLimit: number;

		// If the lesson's language is English, the paragraph is in English.
		// Otherwise, the paragraph is in the lesson's language
		const paragraphLanguage = language;
		const translationLanguage =
			paragraphLanguage == Language.English ? Language.Hebrew : Language.English;

		// Sets mistake type for the wrong paragraph summary
		const randomIndex = Math.floor(Math.random() * SUMMARY_MISTAKE_TYPES.length);
		const mistakeType = SUMMARY_MISTAKE_TYPES[randomIndex];

		// Parameters for novice difficulty
		if (difficulty == Difficulty.Novice) {
			paragraphLengthLimit = 100;
		}
		// Parameters for advanced difficulty
		else if (difficulty == Difficulty.Advanced) {
			paragraphLengthLimit = 200;
		}
		// Parameters for master difficulty
		else {
			paragraphLengthLimit = 250;
		}

		return `generate paragraph ${paragraphLanguage}, fitting for ${Difficulty[difficulty]} difficulty. Paragraph will have up to ${paragraphLengthLimit} words. summary1 is a valid summary of the paragraph. summary2 is the wrong summary, containing a ${mistakeType} mistake. summaries are in ${paragraphLanguage}. Translation string is up to 50 words. Focus on topic: ${topic}. { "prompt": paragraph, "choices": [summary1,summary2] "translation": correct_reply_in_${translationLanguage} }`;
	}

	/**
	 * Creates a query for the API to generate a "choose the grammatical tense" exercise, using the given parameters
	 * @param language the language of the generated exercise
	 * @param difficulty the exercise's difficulty level
	 * @param topic a topic that is included in the prompt to improve result diversity
	 */
	generateChooseTheTense(language: Language, difficulty: Difficulty, topic: string): string {
		// If the lesson's language is English, the sentence is in English.
		// Otherwise, the sentence is in the lesson's language
		const sentenceLanguage = language;
		const translationLanguage =
			sentenceLanguage == Language.English ? Language.Hebrew : Language.English;

		// Sets  random mistake type for one of the replies
		const randomIndex = Math.floor(Math.random() * TENSE_TYPES.length);
		const tenseType = TENSE_TYPES[randomIndex];

		return `generate ${Difficulty[difficulty]}-level sentence in ${sentenceLanguage}. sentence must be in ${tenseType} tense. Sentence must not mention the tense Focus on topic: ${topic}. 'answer' field must contain only the single word ${tenseType} in English. {"question": ${sentenceLanguage}_sentence, "answer": ${tenseType}, "translation": ${translationLanguage}_translation}`;
	}

	/**
	 * Sends a request to the backend to call the API using the given prompt string
	 * @param promptString the prompt string of the exercise to be generated
	 * @returns an observable of the API's response JSON
	 */
	getExerciseFromApi(promptString: string): Observable<object> {
		const { href } = new URL('generateLesson', this.apiUrl);

		// API CONNECTION
		return this.http.post(href, { userPrompt: promptString });
	}
}
