import {LearnVerificationUtils} from './learn-verification.utils';
import {signal, WritableSignal} from '@angular/core';
import {Exercise} from "../../../core/interfaces/exercise.interface";
import {ExerciseType} from "../../../core/enums/exercise-type.enum";
import {MiscUtils} from "../../../core/utils/misc.utils";


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

    it('should return false for non-matching answers', () => {
      const exercise: WritableSignal<Exercise> = signal({
        type: ExerciseType.FillInTheBlank,
        answer: 'hello',
      });

      expect(LearnVerificationUtils.verifyAnswer('hi', exercise)).toBe(false);
    });
  });

  describe('verifyTranslateSentence', () => {
    let exercise: WritableSignal<Exercise> = signal({
      type: ExerciseType.TranslateTheSentence,
      answer: 'the correct translation'
    });
    let penalties: WritableSignal<number> = signal(0);
    let submittedAnswer = "";

    beforeEach( () => {
      penalties.set(0);
    })
    it('should return true for exact match answers, and ratio should be 1', () => {
      submittedAnswer = 'the correct translation';

      expect(LearnVerificationUtils.verifyTranslateSentence(submittedAnswer, exercise, penalties)).toBe(true);
      expect(MiscUtils.getSimilarityRatio(submittedAnswer,exercise)).toEqual(1);
      expect(penalties()).toEqual(0);
    });

    it('should return true for answers with similarity of over 90%, and penalty value should be 1', () => {
      exercise().answer = 'this is a pretty long sentence and is tricky to translate correctly';
      submittedAnswer = 'this a pretty log stence and is tricky to translate correctly';

      expect(LearnVerificationUtils.verifyTranslateSentence(submittedAnswer, exercise, penalties)).toBe(true);
      expect(MiscUtils.getSimilarityRatio(submittedAnswer,exercise)).toBeGreaterThan(0.9);
      expect(MiscUtils.getSimilarityRatio(submittedAnswer,exercise)).toBeLessThan(1);
      expect(penalties()).toEqual(1);
    });

    it('should return true for answers with similarity of 80-90%, and penalty value should be 2', () => {
      exercise().answer = 'this is a pretty long sentence and is tricky to translate correctly';
      submittedAnswer = 'this a pretty log stence and is tricki to tralate correctly';

      expect(LearnVerificationUtils.verifyTranslateSentence(submittedAnswer, exercise, penalties)).toBe(true);
      expect(MiscUtils.getSimilarityRatio(submittedAnswer,exercise)).toBeGreaterThan(0.8);
      expect(MiscUtils.getSimilarityRatio(submittedAnswer,exercise)).toBeLessThanOrEqual(0.9);
      expect(penalties()).toEqual(2);
    });

    it('should return true for answers with similarity of 75-80%, and penalty value should be 3', () => {
      exercise().answer = 'this is a pretty long sentence and is tricky to translate correctly';
      submittedAnswer = 'this a pretty log stence and is tricki to tralate coerctly';

      expect(LearnVerificationUtils.verifyTranslateSentence(submittedAnswer, exercise, penalties)).toBe(true);
      expect(MiscUtils.getSimilarityRatio(submittedAnswer,exercise)).toBeGreaterThanOrEqual(0.75);
      expect(MiscUtils.getSimilarityRatio(submittedAnswer,exercise)).toBeLessThanOrEqual(0.8);
      expect(penalties()).toEqual(3);
    });

    it('should return false for answers with similarity of less than 75%', () => {
      exercise().answer = 'this is a pretty long sentence and is tricky to translate correctly';
      submittedAnswer = 'this a prrety log stence and is tricki to tralate coerctly';

      expect(LearnVerificationUtils.verifyTranslateSentence(submittedAnswer, exercise, penalties)).toBe(false);
      expect(MiscUtils.getSimilarityRatio(submittedAnswer,exercise)).toBeLessThan(0.75);
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
