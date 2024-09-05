import { WritableSignal } from '@angular/core';
import {Exercise} from "../src/app/core/interfaces/exercise.interface";

// Mock implementation for LearnInitializerUtils
export class MockLearnInitializerUtils {
  /**
   * Mock function to initialize the boolean pairs array for matchResults.
   */
  static initializeMatchTheWords(
    matchResults: WritableSignal<[boolean, boolean][]>,
    matchMistakes: WritableSignal<number>,
    exercise: WritableSignal<Exercise>
  ) {
    const newResultsArr: [boolean,boolean][] = [];

    exercise()?.randomizedPairs?.forEach(()=>
      newResultsArr.push([false, false])
    );
    matchResults.set([[false, false]]);
    matchMistakes.set(0);
  }

  /**
   * Mock function to initialize the elements in categoryMatches.
   */
  static initializeMatchTheCategory(
    categoryMatches: WritableSignal<{ wordBank: string[]; cat1: string[]; cat2: string[] }>,
    exercise: WritableSignal<Exercise>
  ) {
    categoryMatches.update((data) => {
      data.cat1 = [];
      data.cat2 = [];
      data.wordBank = exercise().choices ?? [];
      return data;
    });
  }

  /**
   * Mock function to initialize lesson-related parameter values.
   */
  static initializeLessonParams(
    isLessonOver: WritableSignal<boolean>,
    mistakesCounter: WritableSignal<number>,
    lessonExp: WritableSignal<number>
  ) {
    isLessonOver.set(false);
    mistakesCounter.set(0);
    lessonExp.set(0);
  }
}
