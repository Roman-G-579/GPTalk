import { Exercise } from '../../../core/interfaces/exercise.interface';
import _ from 'lodash';
import { ExerciseType } from '../../../core/enums/exercise-type.enum';
import { TOPICS } from '../../../core/utils/topics';
import {
	FUTURE_TENSE_ENG,
	PRESENT_TENSE_ENG,
	PAST_TENSE_ENG,
} from '../../../core/utils/exerciseSpecificConsts';

// The heading strings of the available exercise types
const HEADINGS_MAP: { [key in ExerciseType]: string } = {
	0: 'Fill in the blank',
	1: 'Choose the correct translation',
	2: 'Translate the sentence',
	3: 'Complete the conversation',
	4: 'Match the words',
	5: 'Arrange the words to form a correct sentence',
	6: 'Match the words to their correct category',
	7: 'Summarize the paragraph',
	8: 'Choose the tense',
};

// The instruction strings of the available exercise types
const INSTRUCTIONS_MAP: { [key in ExerciseType]: string } = {
	0: 'Click on an answer or type it and hit the <i>enter</i> key to submit',
	1: 'Click on the correct translation of the given word',
	2: `Write the given sentence in the chosen language`,
	3: `Click on an answer or type it and hit the <i>enter</i> key to submit`,
	4: `Match the words in a given language to their English translations`,
	5: `Click the words sequentially to place them onto the board. Click submit when finished.`,
	6: 'Drag and drop the words to their category container. Click submit when finished.',
	7: 'Click on the option that best summarizes the given paragraph',
	8: 'Click on the correct grammatical tense for the given sentence',
};

/*
  Contains functions related to lesson generation
 */
export class LessonGeneratorUtils {
	/**
	 * Retrieves a random topic from the topics array
	 * @returns a random topic
	 */
	static getRandomTopic() {
		const randomIndex: number = Math.floor(Math.random() * TOPICS.length);
		return TOPICS[randomIndex];
	}

	/**
	 * Converts a JSON object of generated exercise to Exercise object
	 * and adds relevant data
	 * @param exerciseJson the JSON object
	 * @param exerciseType the type of the current exercise
	 * @returns an Exercise object
	 */
	static convertToExerciseObject(exerciseJson: Exercise, exerciseType: ExerciseType): Exercise {
		const exercise: Exercise = {
			type: exerciseType,
			question: exerciseJson.question,
			prompt: exerciseJson.prompt,
			cat_a: exerciseJson.cat_a,
			cat_b: exerciseJson.cat_b,
			words_a: exerciseJson.words_a,
			words_b: exerciseJson.words_b,
			choices: exerciseJson.choices,
			correctPairs: exerciseJson.correctPairs,
			answer: exerciseJson.answer,
			translation: exerciseJson.translation,
			translations: exerciseJson.translations,
		};

		return this.addExerciseSpecificData(exercise);
	}

	/**
	 * Adds heading, instructions and other exercise-specific data to the exercise
	 * @param exercise the given exercise
	 * @returns the updated exercise object
	 */
	private static addExerciseSpecificData(exercise: Exercise): Exercise {
		// Adds heading and instruction based on the exercise type
		exercise.heading = HEADINGS_MAP[exercise.type];
		exercise.instructions = INSTRUCTIONS_MAP[exercise.type];

		// Sets data according to each exercise's needs
		switch (exercise.type) {
			case ExerciseType.FillInTheBlank:
				return this.setFillInTheBlank(exercise);
			case ExerciseType.TranslateWord:
				return this.setTranslateWord(exercise);
			case ExerciseType.TranslateTheSentence:
				return exercise;
			case ExerciseType.CompleteTheConversation:
				return this.setCompleteTheConversation(exercise);
			case ExerciseType.MatchTheWords:
				return this.setMatchTheWords(exercise);
			case ExerciseType.ReorderSentence:
				return this.setReorderSentence(exercise);
			case ExerciseType.MatchTheCategory:
				return this.setMatchTheCategory(exercise);
			case ExerciseType.SummarizeTheParagraph:
				return this.setSummarizeTheParagraph(exercise);
			case ExerciseType.ChooseTheTense:
				return this.setChooseTheTense(exercise);
			default: {
				return exercise;
			}
		}
	}

	/**
	 * Sets the parameters of a "FillInTheBlank" exercise
	 * @param exercise the exercise object
	 * @returns the updated exercise
	 */
	private static setFillInTheBlank(exercise: Exercise): Exercise {
		// Takes the answer sentence and converts it to an array
		const fullSentence = exercise.answer ?? '';
		const sentenceArr = fullSentence.replace(/[,.!?:]/g, '').split(' ');

		// Takes the choices array
		const choices = exercise.choices ?? [];
		let randIndex = Math.floor(Math.random() * sentenceArr.length);

		// Takes out a random word from the full sentence
		const randomWord = sentenceArr[randIndex];

		// Saves the words before and after the extracted word in separate arrays
		const stringsBeforeWord = sentenceArr.slice(0, randIndex);
		const stringsAfterWord = sentenceArr.slice(randIndex + 1);

		// Index to place the word in the choices array
		randIndex = Math.floor(Math.random() * choices.length);

		// Places the word in the choices array
		choices.splice(randIndex, 0, randomWord);

		// Sets the exercise data
		exercise.sentenceBeforeBlank = stringsBeforeWord.join(' ');
		exercise.sentenceAfterBlank = stringsAfterWord.join(' ');
		exercise.choices = choices;
		exercise.answer = randomWord;

		return exercise;
	}

	/**
	 * Sets the parameters of a "TranslateWord" exercise
	 * @param exercise the exercise object
	 * @returns the updated exercise
	 */
	private static setTranslateWord(exercise: Exercise): Exercise {
		// Takes the random words array
		const choices = exercise.choices ?? [];

		// Takes the array of the random word's translations
		const translations = exercise.translations ?? [];

		const randIndex = Math.floor(Math.random() * choices.length);

		// Picks a random word as the exercise's question, moves every possible translation to the choices field,
		// and puts the correct translation in the answer field
		exercise.question = choices[randIndex];
		exercise.choices = translations;
		exercise.answer = translations[randIndex];

		return exercise;
	}

	/**
	 * Sets the parameters of a "CompleteTheConversation" exercise
	 * @param exercise the exercise object
	 * @returns the updated exercise
	 */
	private static setCompleteTheConversation(exercise: Exercise) {
		let choices = exercise.choices ?? ['', ''];
		choices = choices.map((str) => str.replace(/[,.!?:]/g, ''));

		// If the generated choices are identical, remove a random letter from the wrong choice
		if (choices[0] == choices[1]) {
			// Convert the sentence into an array of characters
			const chars = choices[1].split('');

			// Select a random index from the characters array
			const randomIndex = Math.floor(Math.random() * chars.length);

			// Remove the character at the random index
			chars.splice(randomIndex, 1);

			// Join the characters back into a modified sentence
			choices[1] = chars.join('');
		}

		// If more than 2 choices were generated, remove them
		if (choices.length > 2) {
			choices = choices.slice(0, 2);
		}

		exercise.answer = choices[0];

		choices = _.shuffle(choices);
		exercise.choices = choices;

		return exercise;
	}

	/**
	 * Sets the parameters of a "MatchTheWords" exercise
	 * @param exercise the exercise object
	 * @returns the updated exercise
	 */
	private static setMatchTheWords(exercise: Exercise): Exercise {
		exercise.randomizedPairs = this.shuffleWordPairs(exercise.correctPairs ?? []);
		return exercise;
	}

	/**
	 * Sets the parameters of a "ReorderSentence" exercise
	 * @param exercise the exercise object
	 * @returns the updated exercise
	 */
	private static setReorderSentence(exercise: Exercise): Exercise {
		let choices = exercise.answer?.split(' ') ?? [];

		// Shuffles the sentence's words and removes empty strings if they exist
		choices = _.shuffle(choices).filter((word) => word.trim() !== '');

		exercise.choices = choices;
		return exercise;
	}

	/**
	 * Sets the parameters of a "MatchTheCategory" exercise
	 * @param exercise the exercise object
	 * @returns the updated exercise
	 */
	private static setMatchTheCategory(exercise: Exercise): Exercise {
		const choices = [...(exercise.words_a ?? ''), ...(exercise.words_b ?? '')];
		exercise.choices = _.shuffle(choices).filter((word) => word.trim() !== '');
		return exercise;
	}

	/**
	 * Sets the parameters of a "SummarizeTheParagraph" exercise
	 * @param exercise the exercise object
	 * @returns the updated exercise
	 */
	private static setSummarizeTheParagraph(exercise: Exercise): Exercise {
		let choices = exercise.choices ?? [];

		// If more than 2 choices were generated, remove them
		if (choices.length > 2) {
			choices = choices.slice(0, 2);
		}

		exercise.answer = choices[0] ?? '';

		choices = _.shuffle(choices);
		exercise.choices = choices;

		return exercise;
	}

	/**
	 * Sets the parameters of a "ChooseTheTense" exercise
	 * @param exercise the exercise object
	 * @returns the updated exercise
	 */
	private static setChooseTheTense(exercise: Exercise): Exercise {
		const tenses = ['past', 'present', 'future'];
		const question = exercise.question ?? '';
		const translation = exercise.translation ?? '';
		let answer = exercise.answer ?? ''; // The answer contained in the object

		exercise.choices = tenses;

		// If the generated object's answer is not a valid tense, get the correct tense
		// based on the exercise's generated sentence
		if (!exercise.choices.includes(answer)) {
			answer = this.getSentenceTense(question, translation);
		}
		exercise.answer = answer;

		return exercise;
	}

	/**
	 * Shuffles the locations of the left words and the locations of the right words in the array
	 * @param wordPairs an array of string pairs. first element in pair - left word.
	 *                  Second element in pair - right word
	 */
	private static shuffleWordPairs(wordPairs: [string, string][]): [string, string][] {
		const leftWords = wordPairs.map((pair) => pair[0]);
		const rightWords = wordPairs.map((pair) => pair[1]);

		// Shuffle each array independently
		const shuffledLeftWords = _.shuffle(leftWords);
		const shuffledRightWords = _.shuffle(rightWords);

		// Re-pair the shuffled words
		return shuffledLeftWords.map((leftWord, index) => [leftWord, shuffledRightWords[index]]);
	}

	/**
	 * Takes two sentences and analyzes them to find their correct tense
	 * @returns "past" | "present" | "future"
	 * @param sentence1 the first sentence
	 * @param sentence2 the second sentence
	 */
	private static getSentenceTense(sentence1: string, sentence2: string): string {
		const lowerCaseSentence1 = sentence1.toLowerCase();
		const lowerCaseSentence2 = sentence2.toLowerCase();

		// Check for tense patterns
		if (PAST_TENSE_ENG.test(lowerCaseSentence1) || PAST_TENSE_ENG.test(lowerCaseSentence2)) {
			return 'past';
		} else if (
			PRESENT_TENSE_ENG.test(lowerCaseSentence1) ||
			PRESENT_TENSE_ENG.test(lowerCaseSentence2)
		) {
			return 'present';
		} else if (
			FUTURE_TENSE_ENG.test(lowerCaseSentence1) ||
			FUTURE_TENSE_ENG.test(lowerCaseSentence2)
		) {
			return 'future';
		}

		// Default case if no tense is detected
		return 'present';
	}
}
