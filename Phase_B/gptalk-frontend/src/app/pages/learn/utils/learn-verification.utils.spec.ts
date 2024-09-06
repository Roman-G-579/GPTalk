import { LearnVerificationUtils } from './learn-verification.utils';
import { signal, WritableSignal } from '@angular/core';
import {Exercise} from "../../../core/interfaces/exercise.interface";
import {ExerciseType} from "../../../core/enums/exercise-type.enum";


describe('LearnVerificationUtils', () => {
  describe('verifyAnswer', () => {
    it('should return true for exact match answers', () => {
      const exercise: WritableSignal<Exercise> = signal({
        type: ExerciseType.FillInTheBlank,
        answer: 'hello',
      });

      expect(LearnVerificationUtils.verifyAnswer('hello', exercise)).toBe(true);
    });

    it('should ignore punctuation and return true for normalized answers', () => {
      const exercise: WritableSignal<Exercise> = signal({
        type: ExerciseType.FillInTheBlank,
        answer: 'hello',
      });

      expect(LearnVerificationUtils.verifyAnswer('Hello!!', exercise)).toBe(true);
    });

    it('should return true for close matches in TranslateTheSentence type', () => {
      const exercise: WritableSignal<Exercise> = signal({
        type: ExerciseType.TranslateTheSentence,
        answer: 'hola',
      });

      // Assuming `distance` function returns a distance less than 4
      expect(LearnVerificationUtils.verifyAnswer('hol', exercise)).toBe(true);
    });

    it('should return false for non-matching answers', () => {
      const exercise: WritableSignal<Exercise> = signal({
        type: ExerciseType.FillInTheBlank,
        answer: 'hello',
      });

      expect(LearnVerificationUtils.verifyAnswer('hi', exercise)).toBe(false);
    });
  });

  describe('verifyMatch', () => {
    it('should return "matchFound" if a match is found', () => {
      const chosenPair: WritableSignal<[string, string]> = signal(['טסט', 'test']);
      const matchResults: WritableSignal<[boolean, boolean][]> = signal([[false, false], [false, false]]);
      const exercise: WritableSignal<Exercise> = signal({
        type: ExerciseType.MatchTheWords,
        correctPairs: [['טסט', 'test']],
        randomizedPairs: [['טסט', 'wrongWord'], ['wrongWord2', 'test']],
      });

      expect(LearnVerificationUtils.verifyMatch(chosenPair, matchResults, exercise)).toBe('matchFound');
      expect(matchResults()).toEqual([[true, false], [false, true]]);
    });

    it('should return "allMatchesFound" if all matches are found', () => {
      const chosenPair: WritableSignal<[string, string]> = signal(['טסט', 'test']);
      const matchResults: WritableSignal<[boolean, boolean][]> = signal([[false, false]]);
      const exercise: WritableSignal<Exercise> = signal({
        type: ExerciseType.MatchTheWords,
        correctPairs: [['טסט', 'test']],
        randomizedPairs: [['טסט', 'test']],
      });

      LearnVerificationUtils.verifyMatch(chosenPair, matchResults, exercise);
      chosenPair.set(['טסט', 'test']);
      expect(LearnVerificationUtils.verifyMatch(chosenPair, matchResults, exercise)).toBe('allMatchesFound');
    });

    it('should return "wrongMatch" if no match is found', () => {
      const chosenPair: WritableSignal<[string, string]> = signal(['word1', 'wrongWord1']);
      const matchResults: WritableSignal<[boolean, boolean][]> = signal([[false, false], [false, false]]);
      const exercise: WritableSignal<Exercise> = signal({
        type: ExerciseType.MatchTheWords,
        correctPairs: [['word1', 'word2']],
        randomizedPairs: [['word1', 'wrongWord1'],['wrongWord2', 'word2']],
      });

      expect(LearnVerificationUtils.verifyMatch(chosenPair, matchResults, exercise)).toBe('wrongMatch');
    });
  });

  describe('verifyCategories', () => {
    it('should return true when all words match the correct categories', () => {
      const categoryMatches: WritableSignal<{ wordBank: string[], cat1: string[], cat2: string[] }> = signal({
        wordBank: [],
        cat1: ['apple', 'orange'],
        cat2: ['cat', 'dog']
      });
      const exercise: WritableSignal<Exercise> = signal({
        type: ExerciseType.MatchTheCategory,
        words_a: ['apple', 'orange'],
        words_b: ['cat', 'dog']
      });

      expect(LearnVerificationUtils.verifyCategories(categoryMatches, exercise)).toBe(true);
    });

    it('should return false when not all words match their categories', () => {
      const categoryMatches: WritableSignal<{ wordBank: string[], cat1: string[], cat2: string[] }> = signal({
        wordBank: [],
        cat1: ['apple', 'cat'],
        cat2: ['dog', 'orange']
      });
      const exercise: WritableSignal<Exercise> = signal({
        type: ExerciseType.MatchTheCategory,
        words_a: ['apple', 'orange'],
        words_b: ['cat', 'dog'],
      });

      expect(LearnVerificationUtils.verifyCategories(categoryMatches, exercise)).toBe(false);
    });
  });
});
