import { WritableSignal } from '@angular/core';
import { Exercise } from '../../../models/exercise.interface';

export class LearnInitializerUtils {
  /**
   * Initializes the boolean pairs array for the matchResults signal
   * based on the size of the current exercise's word pair amount
   * @param matchResults the signal containing the match result pairs
   * @param exercise the data of the currently active exercise
   */
  static initializeMatchResults(matchResults: WritableSignal<[boolean,boolean][]>, exercise: WritableSignal<Exercise>) {
    const newResultsArr: [boolean,boolean][] = [];

    // The results array matches in size the word pairs array in the current exercise
    exercise()?.randomizedPairs?.forEach(()=>
      newResultsArr.push([false, false])
    );
    matchResults.set(newResultsArr);
  }

  /**
   * Initializes all the elements in the categoryMatches signal
   * @param categoryMatches the signal containing data relevant to the MatchTheCategory exercise
   * @param exercise signal containing the current exercise data
   */
  static initializeMatchTheCategory(categoryMatches: WritableSignal<{categories: [string,string], wordBank: string[], cat1: string[], cat2: string[]}>, exercise: WritableSignal<Exercise>) {
    const pairsArray = exercise().correctPairs ?? [];
    const words = Array.from(new Set(pairsArray.map(pair => pair[0])));
    const categories = Array.from(new Set(pairsArray.map(pair => pair[1])));
    categoryMatches.update(data => {
      data.categories = [categories[0],categories[1]];
      data.cat1 = [];
      data.cat2 = [];
      data.wordBank = words;
      return data;
    });
  }

  /**
   * Resets the states of all exercise-data related signals
   *
   * @param isDone boolean determining whether an exercise is finished
   * @param isCorrectAnswer boolean determining whether the answer for the current exercise is correct
   * @param chosenWords signal containing an array of the strings constructing the sentence in the
   * reorderSentence exercise
   */
  static resetSignals(isDone: WritableSignal<boolean>, isCorrectAnswer: WritableSignal<boolean>, chosenWords: WritableSignal<string[]>) {
    isDone.set(false);
    isCorrectAnswer.set(false);
    chosenWords.set([]);
  }

  /**
   * Resets the match mistakes counter, used in the matchTheWords exercise
   * @param counters signal containing the counters used in the learn component
   */
  static resetMatchMistakes(counters: WritableSignal<{correctAnswers: number, totalExercises: number, matchMistakes: number}>) {
    counters.update(counters => {
      counters.matchMistakes = 0;
      return counters;
    })
  }
}
