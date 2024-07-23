import { WritableSignal } from '@angular/core';
import { Exercise } from '../../../models/exercise.interface';

export class LearnInitializerUtils {
  /**
   * Initializes the boolean pairs array for the matchResults signal
   * based on the size of the current exercise's word pair amount,
   * and initializes the mistakes counter
   * @param matchResults the signal containing the match result pairs
   * @param matchMistakes the mistakes counter for the exercise
   * @param exercise the data of the currently active exercise
   */
  static initializeMatchTheWords(matchResults: WritableSignal<[boolean,boolean][]>, matchMistakes: WritableSignal<number>, exercise: WritableSignal<Exercise>) {
    const newResultsArr: [boolean,boolean][] = [];

    // The results array matches in size the word pairs array in the current exercise
    exercise()?.randomizedPairs?.forEach(()=>
      newResultsArr.push([false, false])
    );
    matchResults.set(newResultsArr);
    matchMistakes.set(0);
  }

  /**
   * Initializes all the elements in the categoryMatches signal
   * @param categoryMatches the signal containing data relevant to the MatchTheCategory exercise
   * @param exercise signal containing the current exercise data
   */
  static initializeMatchTheCategory(categoryMatches: WritableSignal<{wordBank: string[], cat1: string[], cat2: string[]}>, exercise: WritableSignal<Exercise>) {
    categoryMatches.update(data => {
      data.cat1 = [];
      data.cat2 = [];
      data.wordBank = exercise().choices ?? [];
      return data;
    });
  }

  /**
   * Initializes lesson related parameter values
   * @param isLessonOver boolean determining whether the current lesson is over
   * @param mistakesCounter the amount of mistakes in the current lesson
   */
  static initializeLessonParams(
    isLessonOver: WritableSignal<boolean>,
    mistakesCounter: WritableSignal<number>,
  ) {
    isLessonOver.set(false);
    mistakesCounter.set(0);
  }

}
