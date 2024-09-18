import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { LessonGeneratorService } from './lesson-generator.service';
import { of } from 'rxjs';
import { Language } from '../../core/enums/language.enum';
import { Difficulty } from '../../core/enums/difficulty.enum';
import { Exercise } from '../../core/interfaces/exercise.interface';
import { LessonGeneratorUtils } from './utils/lesson-generator.utils';
import { ExerciseType } from '../../core/enums/exercise-type.enum';
import { environment } from '../../../environments/environment';

jest.mock('./utils/lesson-generator.utils');

describe('LessonGeneratorService', () => {
	let lessonGeneratorService: LessonGeneratorService;
	let httpMock: HttpTestingController;

	let language: Language;
	let difficulty: Difficulty;
	let topic: string = 'technology';

	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [HttpClientTestingModule],
			providers: [LessonGeneratorService],
		});

		lessonGeneratorService = TestBed.inject(LessonGeneratorService);
		httpMock = TestBed.inject(HttpTestingController);

		// Initialize variables for all tests
		language = Language.English;
		difficulty = Difficulty.Novice;

		jest.spyOn(LessonGeneratorUtils, 'getRandomTopic').mockReturnValue('technology');
	});

	afterEach(() => {
		httpMock.verify();
	});

	function getPromptMocks() {
		jest
			.spyOn(lessonGeneratorService, 'generateFillInTheBlank')
			.mockReturnValue('mockExercise_FillInTheBlank');
		jest
			.spyOn(lessonGeneratorService, 'generateTranslateWord')
			.mockReturnValue('mockExercise_TranslateWord');
		jest
			.spyOn(lessonGeneratorService, 'generateTranslateTheSentence')
			.mockReturnValue('mockExercise_TranslateTheSentence');
		jest
			.spyOn(lessonGeneratorService, 'generateCompleteTheConversation')
			.mockReturnValue('mockExercise_CompleteTheConversation');
		jest
			.spyOn(lessonGeneratorService, 'generateMatchTheWords')
			.mockReturnValue('mockExercise_MatchTheWords');
		jest
			.spyOn(lessonGeneratorService, 'generateReorderSentence')
			.mockReturnValue('mockExercise_ReorderSentence');
		jest
			.spyOn(lessonGeneratorService, 'generateMatchTheCategory')
			.mockReturnValue('mockExercise_MatchTheCategory');
	}
	describe('generateLesson', () => {
		it('should generate the specified number of exercises', () => {
			const amount = 3;

			const mockExercise: Exercise = {
				type: ExerciseType.TranslateWord,
				choices: ['מכונית', 'ספר', 'שולחן', 'תפוח'],
				translations: ['car', 'book', 'table', 'apple'],
			};

			//jest.spyOn(LessonGeneratorUtils, 'getRandomTopic').mockReturnValue('technology');

			getPromptMocks();

			jest.spyOn(LessonGeneratorUtils, 'convertToExerciseObject').mockReturnValue(mockExercise);
			jest.spyOn(lessonGeneratorService, 'getExerciseFromApi').mockReturnValue(of(mockExercise));

			lessonGeneratorService.generateLesson(language, difficulty, amount).subscribe((result) => {
				expect(result.length).toBe(amount);
			});
		});

		it('should handle the exercise generation correctly', () => {
			const amount = 2;
			const mockExercise: Exercise = {
				type: ExerciseType.TranslateWord,
				choices: ['מכונית', 'ספר', 'שולחן', 'תפוח'],
				translations: ['car', 'book', 'table', 'apple'],
			};

			//jest.spyOn(LessonGeneratorUtils, 'getRandomTopic').mockReturnValue('technology');

			getPromptMocks();

			jest.spyOn(LessonGeneratorUtils, 'convertToExerciseObject').mockReturnValue(mockExercise);
			jest.spyOn(lessonGeneratorService, 'getExerciseFromApi').mockReturnValue(of(mockExercise));

			lessonGeneratorService.generateLesson(language, difficulty, amount).subscribe((exercises) => {
				expect(exercises[0]).toEqual(mockExercise);
			});
		});
	});

	describe('generateFillInTheBlank', () => {
		it('should generate a correct prompt format for valid input', () => {
			const result = lessonGeneratorService.generateFillInTheBlank(language, difficulty, topic);

			// Check the output format
			expect(result).toMatch(
				`generate an object in English, Novice difficulty. 'answer' is the sentence, 'translation' is its Hebrew translation, 'choices' is 3 random words. Every word in 'choices' must not fit the sentence in 'answer'. Focus on topic: technology. {"answer": "", "choices:" [], "translation": ""}`,
			);
		});
	});

	describe('generateTranslateWord', () => {
		it('should generate a correct prompt format for valid input', () => {
			const result = lessonGeneratorService.generateTranslateWord(language, difficulty, topic);

			expect(result).toMatch(
				`generate word array, difficulty: Novice, language: Hebrew. number of words: 3. Focus on topic: technology. {"choices": [array_of_words] "translations": [array_of_English_translations] }`,
			);
		});
	});

	describe('generateTranslateTheSentence', () => {
		it('should generate a correct prompt format for valid input', () => {
			const result = lessonGeneratorService.generateTranslateTheSentence(
				language,
				difficulty,
				topic,
			);

			expect(result).toMatch(
				`generate a "translate the sentence" exercise, difficulty: Novice. Focus on topic: technology. {"question": "Hebrew sentence", "answer": "English_translation"}`,
			);
		});
	});

	describe('generateCompleteTheConversation', () => {
		it('should generate a correct prompt format for valid input', () => {
			const result = lessonGeneratorService.generateCompleteTheConversation(
				language,
				difficulty,
				topic,
			);

			expect(result).toContain(
				'generate object of strings in English. All sentences of Novice difficulty. reply1 is a grammatically and logically correct reply, reply2 contains',
			);
		});
	});

	describe('generateMatchTheWords', () => {
		it('should generate a correct prompt format for valid input', () => {
			const result = lessonGeneratorService.generateMatchTheWords(language, difficulty, topic);

			expect(result).toMatch(
				`Generate an array of word pairs in English, Novice difficulty. 4 pairs. Make sure there are no repeat words. Focus on topic: technology. Follow this json structure: "correctPairs": { ["word","Hebrew_translation"] }`,
			);
		});
	});

	describe('generateReorderSentence', () => {
		it('should generate a correct prompt format for valid input', () => {
			const result = lessonGeneratorService.generateReorderSentence(language, difficulty, topic);

			expect(result).toMatch(
				`generate a 4 words long sentence (no repeating words), in English, Novice difficulty. Focus on topic: technology { "answer": "", "translation": "Hebrew_translation" }`,
			);
		});
	});

	describe('generateMatchTheCategory', () => {
		it('should generate a correct prompt format for valid input', () => {
			const result = lessonGeneratorService.generateMatchTheCategory(language, difficulty, topic);

			expect(result).toMatch(
				`Generate 2 distinct categories and 4 words for each, in English, Novice difficulty. Focus on topic: technology. The 2 categories must be different from each other in sch a way that each word only belongs to one of them. Ensure the response is strictly in the following JSON format: { "cat_a": "", "cat_b": "", "words_a": [], "words_b": [] }. Do not include any additional keys.`,
			);
		});
	});

	describe('generateSummarizeTheParagraph', () => {
		it('should generate a correct prompt format for valid input', () => {
			const result = lessonGeneratorService.generateSummarizeTheParagraph(
				language,
				difficulty,
				topic,
			);

			expect(result).toMatch(
				`generate paragraph English, fitting for Novice difficulty. Paragraph will have up to 100 words. summary1 is a valid summary of the paragraph. summary2 is the wrong summary, containing a misinterpretation mistake. summaries are in English. Translation string is up to 50 words. Focus on topic: technology. { "prompt": paragraph, "choices": [summary1,summary2] "translation": correct_reply_in_Hebrew }`,
			);
		});
	});

	describe('generateChooseTheTense', () => {
		it('should generate a correct prompt format for valid input', () => {
			const result = lessonGeneratorService.generateChooseTheTense(language, difficulty, topic);

			expect(result).toContain(`generate Novice-level sentence in English`);
			expect(result).toContain('Focus on topic: technology');
			expect(result).toContain('"question": English_sentence');
			expect(result).toContain('Hebrew_translation}');
			//. sentence must be in ${tenseType} tense. Sentence must not mention the tense Focus on topic: ${topic}. 'answer' field must contain only the single word ${tenseType} in English. {"question": ${sentenceLanguage}_sentence, "answer": ${tenseType}, "translation": ${translationLanguage}_translation}`);
		});
	});

	describe('getExerciseFromApi', () => {
		it('should send a POST request with the correct prompt string', () => {
			const promptString = 'Test prompt';
			const expectedResponse = { success: true }; // Example response from the backend

			lessonGeneratorService.getExerciseFromApi(promptString).subscribe((response) => {
				expect(response).toEqual(expectedResponse);
			});

			const req = httpMock.expectOne(`${environment.apiUrl}generateLesson`);
			expect(req.request.method).toBe('POST');
			expect(req.request.body).toEqual({ userPrompt: promptString });

			// Simulate the response from the backend
			req.flush(expectedResponse);
		});

		it('should handle error response from the backend', () => {
			const promptString = 'Test prompt';
			const expectedResponse = { success: false };

			lessonGeneratorService.getExerciseFromApi(promptString).subscribe({
				next: (response) => {
					expect(response).toEqual(expectedResponse);
				},
				error: () => fail('Should not have called error callback'),
			});

			const req = httpMock.expectOne(`${environment.apiUrl}generateLesson`);
			expect(req.request.method).toBe('POST');
			expect(req.request.body).toEqual({ userPrompt: promptString });

			// Simulate an error response from the backend
			req.flush('Error message', { status: 500, statusText: 'Internal Server Error' });
		});
	});
});
