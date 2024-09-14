import { ElementRef, input, signal, WritableSignal } from '@angular/core';
import { LearnHtmlUtils } from './learn-html.utils';
import { Exercise } from '../../../core/interfaces/exercise.interface';
import { ExerciseType } from '../../../core/enums/exercise-type.enum';
import { Language } from '../../../core/enums/language.enum';

describe('LearnHtmlUtils', () => {
	describe('forceFocus', () => {
		it('should focus on the input field if inputFieldRef is provided', () => {
			const mockElementRef = {
				nativeElement: {
					focus: jest.fn(),
				},
			} as unknown as ElementRef;

			LearnHtmlUtils.forceFocus(mockElementRef);
			expect(mockElementRef.nativeElement.focus).toHaveBeenCalled();
		});

		it('should not throw an error if inputFieldRef is not provided', () => {
			expect(() => LearnHtmlUtils.forceFocus(null as never)).not.toThrow();
		});
	});

	describe('elemContainsAnswer', () => {
		it('should return true if the choice matches the exercise answer', () => {
			const exerciseSignal: WritableSignal<Exercise> = signal({
				type: ExerciseType.FillInTheBlank,
				answer: 'correctAnswer',
			});

			expect(LearnHtmlUtils.elemContainsAnswer('correctAnswer', exerciseSignal)).toBe(true);
		});

		it('should return false if the choice does not match the exercise answer', () => {
			const exerciseSignal: WritableSignal<Exercise> = signal({
				type: ExerciseType.FillInTheBlank,
				answer: 'wrongAnswer',
			});

			expect(LearnHtmlUtils.elemContainsAnswer('correctAnswer', exerciseSignal)).toBe(false);
		});
	});

	describe('langDirection', () => {
		it('should return "rtl" for Hebrew language', () => {
			const languageSignal: WritableSignal<Language> = signal(Language.Hebrew);

			expect(LearnHtmlUtils.langDirection(languageSignal)).toBe('rtl');
		});

		it('should return "ltr" for non-Hebrew languages', () => {
			const languageSignal: WritableSignal<Language> = signal(Language.English);

			expect(LearnHtmlUtils.langDirection(languageSignal)).toBe('ltr');
		});
	});

	describe('highlightMistakes', () => {
		let exercise: WritableSignal<Exercise> = signal({
			type: ExerciseType.TranslateTheSentence,
			answer: 'this is a test',
		});
		let inputText = '';

		it('should return the same text if the input matches the answer exactly', () => {
			inputText = 'This is a test';

			const result = LearnHtmlUtils.highlightMistakes(inputText, exercise);

			expect(result).toBe('this is a test');
		});

		it('should highlight the incorrect words when input does not match answer', () => {
			inputText = 'This is a tssst';

			const result = LearnHtmlUtils.highlightMistakes(inputText, exercise);

			expect(result).toBe('this is a <strong>tssst</strong>');
		});

		it('should not highlight words with nearby matches', () => {
			inputText = 'This a is test';

			const result = LearnHtmlUtils.highlightMistakes(inputText, exercise);

			expect(result).toBe('this a is test');
		});

		it('should handle extra punctuation and spaces correctly', () => {
			inputText = 'This     a     is       test!';

			const result = LearnHtmlUtils.highlightMistakes(inputText, exercise);

			expect(result).toBe('this a is test');
		});

		it('should highlight all words if none match', () => {
			inputText = 'i dont know the answer';

			const result = LearnHtmlUtils.highlightMistakes(inputText, exercise);

			expect(result).toBe(
				'<strong>i</strong> <strong>dont</strong> <strong>know</strong> <strong>the</strong> <strong>answer</strong>',
			);
		});

		it('should handle case-insensitive comparison', () => {
			inputText = 'THIS IS A TEST';

			const result = LearnHtmlUtils.highlightMistakes(inputText, exercise);

			expect(result).toBe('this is a test');
		});

		it('should handle empty input correctly', () => {
			inputText = '';

			const result = LearnHtmlUtils.highlightMistakes(inputText, exercise);

			expect(result).toBe('');
		});

		it('should handle input longer than the answer by highlighting extra words', () => {
			inputText = 'this is a test with extra words';

			const result = LearnHtmlUtils.highlightMistakes(inputText, exercise);

			expect(result).toBe(
				'this is a test <strong>with</strong> <strong>extra</strong> <strong>words</strong>',
			);
		});
	});
});
