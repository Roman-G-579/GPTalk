import { signal, WritableSignal } from '@angular/core';
import { MiscUtils } from './misc.utils';
import { Exercise } from '../interfaces/exercise.interface';
import { ExerciseType } from '../enums/exercise-type.enum';

describe('MiscUtils', () => {
	const mockExercise_TranslateWord: WritableSignal<Exercise> = signal<Exercise>({
		type: ExerciseType.TranslateWord,
		question: 'תפוח',
		choices: ['car', 'BOOK!', 'table', 'Apple'],
		answer: 'Apple',
	});

	const mockExercise_MatchTheWords: WritableSignal<Exercise> = signal<Exercise>({
		type: ExerciseType.MatchTheWords,
		correctPairs: [
			['מכונית', 'CAR'],
			['בית', 'House'],
			['חתול', 'cat'],
		],
		randomizedPairs: [
			['בית', 'cat'],
			['מכונית', 'House'],
			['חתול', 'CAR'],
		],
	});

	const mockExerciseArr: WritableSignal<Exercise[]> = signal([
		{ type: ExerciseType.FillInTheBlank },
		{ type: ExerciseType.TranslateWord },
		{ type: ExerciseType.ReorderSentence },
	]);

	describe('lowerCaseAndNormalizeAll', () => {
		it('should normalize and lowercase all strings in exercise data', () => {
			MiscUtils.lowerCaseAndNormalizeAll(mockExercise_TranslateWord);
			MiscUtils.lowerCaseAndNormalizeAll(mockExercise_MatchTheWords);

			expect(mockExercise_TranslateWord().question).toBe('תפוח');
			expect(mockExercise_TranslateWord().answer).toBe('apple');
			expect(mockExercise_TranslateWord().choices).toEqual(['car', 'book', 'table', 'apple']);
			expect(mockExercise_MatchTheWords().correctPairs).toEqual([
				['מכונית', 'car'],
				['בית', 'house'],
				['חתול', 'cat'],
			]);
			expect(mockExercise_MatchTheWords().randomizedPairs).toEqual([
				['בית', 'cat'],
				['מכונית', 'house'],
				['חתול', 'car'],
			]);
		});
	});

	describe('findClosestString', () => {
		it('should return an empty string if the input does not start with the first letter of the answer', () => {
			const result = MiscUtils.findClosestString('hello', mockExercise_TranslateWord);
			expect(result).toBe('');
		});

		it('should return an empty string if the closest distance is greater than 2', () => {
			const result = MiscUtils.findClosestString('zzz', mockExercise_TranslateWord);
			expect(result).toBe('');
		});

		it('should return the closest matching string', () => {
			const result = MiscUtils.findClosestString('apple', mockExercise_TranslateWord);
			expect(result).toBe('apple');
		});
	});

	describe('exerciseArrShift', () => {
		it('should remove the first element from the exercises array and return it', () => {
			const firstElement = MiscUtils.exerciseArrShift(mockExerciseArr);

			expect(firstElement).toEqual({ type: ExerciseType.FillInTheBlank });
			expect(mockExerciseArr().length).toBe(2);
			expect(mockExerciseArr()).toEqual([
				{ type: ExerciseType.TranslateWord },
				{ type: ExerciseType.ReorderSentence },
			]);
		});
	});

	describe('getSimilarityRatio', () => {
		const exercise: WritableSignal<Exercise> = signal<Exercise>({
			type: ExerciseType.TranslateTheSentence,
			answer: 'this is a test sentence',
		});
		let submittedAnswer: string;

		it('should return 1 for an exact match', () => {
			submittedAnswer = 'this is a test sentence';

			const result = MiscUtils.getSimilarityRatio(submittedAnswer, exercise);

			expect(result).toBe(1);
		});

		it('should return 0 for completely different words', () => {
			submittedAnswer = 'completely different input';

			const result = MiscUtils.getSimilarityRatio(submittedAnswer, exercise);

			expect(result).toBe(0);
		});

		it('should return the correct similarity ratio for partially correct input', () => {
			submittedAnswer = 'This is not a drill';

			const result = MiscUtils.getSimilarityRatio(submittedAnswer, exercise);

			expect(result).toBe(0.6);
		});

		it('should handle case-insensitive matching', () => {
			submittedAnswer = 'THIS IS A TEST';

			const result = MiscUtils.getSimilarityRatio(submittedAnswer, exercise);

			expect(result).toBe(1);
		});

		it('should handle punctuation and extra spaces', () => {
			submittedAnswer = 'this. is. a! test?';

			const result = MiscUtils.getSimilarityRatio(submittedAnswer, exercise);

			expect(result).toBe(1);
		});

		it('should handle input longer than the answer', () => {
			submittedAnswer = 'This is a test with extra words';

			const result = MiscUtils.getSimilarityRatio(submittedAnswer, exercise);

			expect(result).toBe(0.4);
		});

		it('should return 0 for an empty input', () => {
			submittedAnswer = '';

			const result = MiscUtils.getSimilarityRatio(submittedAnswer, exercise);

			expect(result).toBe(0);
		});

		it('should return 0 for an empty input', () => {
			submittedAnswer = '';

			const result = MiscUtils.getSimilarityRatio(submittedAnswer, exercise);

			expect(result).toBe(0);
		});
	});

	describe('calculateExpForNextLevel', () => {
		it('should calculate the correct experience points needed for the next level', () => {
			expect(MiscUtils.calculateExpForNextLevel(1)).toBe(100);
			expect(MiscUtils.calculateExpForNextLevel(2)).toBe(200);
			expect(MiscUtils.calculateExpForNextLevel(3)).toBe(400);
		});
	});

	describe('calculateLevel', () => {
		it('should return the correct level based on total experience points', () => {
			expect(MiscUtils.calculateLevel(50)).toBe(1);
			expect(MiscUtils.calculateLevel(100)).toBe(2);
			expect(MiscUtils.calculateLevel(200)).toBe(3);
			expect(MiscUtils.calculateLevel(800)).toBe(5);
		});
	});
});
