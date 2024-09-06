import {LearnInitializerUtils} from './learn-initializer.utils'; // Adjust the import path according to your file structure
import {signal, WritableSignal} from '@angular/core';
import {Exercise} from "../../../core/interfaces/exercise.interface";
import {ExerciseType} from "../../../core/enums/exercise-type.enum"; // Replace this import based on your signal usage

describe('LearnInitializerUtils', () => {
  describe('initializeMatchTheWords', () => {
    it('should initialize matchResults and matchMistakes correctly', () => {
      const matchResults: WritableSignal<[boolean, boolean][]> = signal([]);

      // Simulates an end-of-exercise state for the mistakes counter
      const matchMistakes: WritableSignal<number> = signal(5);
      const exercise: WritableSignal<Exercise> = signal({
        type: ExerciseType.MatchTheWords,
        randomizedPairs: [['word1', 'word2'], ['word3', 'word4']],
      });

      LearnInitializerUtils.initializeMatchTheWords(matchResults, matchMistakes, exercise);

      expect(matchResults()).toEqual([[false, false], [false, false]]);
      expect(matchMistakes()).toBe(0);
    });

    it('should handle exercises with no randomized pairs correctly', () => {
      const matchResults: WritableSignal<[boolean, boolean][]> = signal([]);
      const matchMistakes: WritableSignal<number> = signal(3);
      const exercise: WritableSignal<Exercise> = signal({
        type: ExerciseType.MatchTheWords,
        randomizedPairs: [],
      });

      LearnInitializerUtils.initializeMatchTheWords(matchResults, matchMistakes, exercise);

      expect(matchResults()).toEqual([]);
      expect(matchMistakes()).toBe(0);
    });
  });

  describe('initializeMatchTheCategory', () => {
    it('should initialize categoryMatches correctly', () => {
      const categoryMatches: WritableSignal<{ wordBank: string[], cat1: string[], cat2: string[] }> = signal({
        wordBank: [],
        cat1: ['category1'],
        cat2: ['category2']
      });
      const exercise: WritableSignal<Exercise> = signal({
        type: ExerciseType.MatchTheCategory,
        choices: ['word1', 'word2','word3','word4'],
      });

      LearnInitializerUtils.initializeMatchTheCategory(categoryMatches, exercise);

      expect(categoryMatches()).toEqual({
        wordBank: ['word1', 'word2','word3','word4'],
        cat1: [],
        cat2: []
      });
    });

    it('should handle exercises with no choices correctly', () => {
      const categoryMatches: WritableSignal<{ wordBank: string[], cat1: string[], cat2: string[] }> = signal({
        wordBank: [],
        cat1: ['category1'],
        cat2: ['category2']
      });
      const exercise: WritableSignal<Exercise> = signal({
        type: ExerciseType.MatchTheCategory,
        choices: [],
      });

      LearnInitializerUtils.initializeMatchTheCategory(categoryMatches, exercise);

      expect(categoryMatches()).toEqual({
        wordBank: [],
        cat1: [],
        cat2: []
      });
    });
  });

  describe('initializeLessonParams', () => {
    it('should initialize lesson parameters correctly', () => {
      const isLessonOver: WritableSignal<boolean> = signal(true);
      const mistakesCounter: WritableSignal<number> = signal(5);
      const lessonExp: WritableSignal<number> = signal(100);

      LearnInitializerUtils.initializeLessonParams(isLessonOver, mistakesCounter, lessonExp);

      expect(isLessonOver()).toBe(false);
      expect(mistakesCounter()).toBe(0);
      expect(lessonExp()).toBe(0);
    });
  });
});
