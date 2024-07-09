import _ from 'lodash';
import { WritableSignal } from '@angular/core';
import { Exercise } from '../../../models/exercise.interface';
import { closest, distance } from 'fastest-levenshtein';

/**
 * Contains various miscellaneous functions related to learn functionality
 */
export class LearnMiscUtils {

  /**
   * Shuffles the locations of the left words and the locations of the right words in the array
   * @param wordPairs an array of string pairs. first element in pair - left word.
   *                  Second element in pair - right word
   */
  static shuffleWordPairs(wordPairs: [string, string][]): [string, string][] {
    const leftWords = wordPairs.map(pair => pair[0]);
    const rightWords = wordPairs.map(pair => pair[1]);

    // Shuffle each array independently
    const shuffledLeftWords = _.shuffle(leftWords);
    const shuffledRightWords = _.shuffle(rightWords);

    // Re-pair the shuffled words
    return shuffledLeftWords.map((leftWord, index) => [leftWord, shuffledRightWords[index]])
  }

  /**
   * Converts every question and answer related string to normalized and lowercase for easier comparisons
   */
  static lowerCaseAndNormalizeAll(exercise: WritableSignal<Exercise>) {
    exercise.update( data => {
      data.question = data.question?.normalize().toLowerCase();
      data.answer = data.answer?.normalize().toLowerCase();
      data.choices = data.choices?.map(elem => elem.normalize().toLowerCase());
      data.correctPairs = data.correctPairs?.map(pair => [pair[0].normalize().toLowerCase(), pair[1].normalize().toLowerCase()]);
      data.randomizedPairs = data.randomizedPairs?.map(pair => [pair[0].normalize().toLowerCase(), pair[1].normalize().toLowerCase()]);
      return data;
    })
  }

  /**
   * Finds the closest matching string (from the available choices) to the given input
   *
   * Used by exercise types: FillInTheBlank, CompleteTheConversation
   * @param str the string that will be evaluated
   * @param exercise the data of the currently active exercise
   */
  static findClosestString(str: string, exercise: WritableSignal<Exercise>) {

    // If the given string doesn't start with the first letter of the answer, dismiss the answer
    if (!exercise().answer?.startsWith(str[0])) {
      return "";
    }

    // If the string is too different from any given choice, the answer counts as invalid
    if (this.getClosestDistance(str, exercise) > 2) {
      return "";
    }

    return closest(str, exercise().choices ?? []);
  }

  /**
   * Returns the smallest Levenshtein distance value
   * between the given string and the strings in the choices array
   *
   * Used by exercise types: FillInTheBlank, CompleteTheConversation
   * @param str the string that will be evaluated
   * @param exercise the data of the currently active exercise
   */
  private static getClosestDistance(str: string, exercise: WritableSignal<Exercise>) {
    let dist = Infinity; // Initial distance value

    exercise().choices?.forEach(choice => {
      const curDist = distance(str, choice);

      //update the smallest distance value if a smaller one than the current minimum is found
      if (curDist < dist) {
        dist = curDist;
      }
    });
    return dist;
  }

  /**
   * Adds 1 to the correct answers counter signal
   * @param correctAndTotalExercises the signal that contains the correct answers counter
   */
  static incrementCorrectAnswers(correctAndTotalExercises: WritableSignal<[number,number]>) {
    correctAndTotalExercises.update(cntArr => {
      cntArr[0] += 1;
      return cntArr;
    });
  }

  /**
   * Increments the correct answers and the match mistakes counters based on the given data
   * @param counters signal containing the counter data
   * @param correctIncr counts correct answers in the lesson. 0 - do not increment, 1 - increment
   * @param matchMistakesIncr counts mistakes in the "match the words" exercise. 0 - do not increment, 1 - increment
   */
  static incrementCounters(
    counters: WritableSignal<{correctAnswers: number, totalExercises: number, matchMistakes: number}>,
    correctIncr: number = 0,
    matchMistakesIncr: number = 0)
  {
    counters.update(counters => {
      counters.correctAnswers += correctIncr;
      counters.matchMistakes += matchMistakesIncr;
      return counters;
    });
  }

  /**
   * Changes the state of the isLessonOver boolean signal to true.
   * signalling the HTML template to display the results screen
   * @param isLessonOver the signal that contains the boolean
   */
  static displayResultsScreen(isLessonOver: WritableSignal<boolean>) {
    isLessonOver.set(true);
  }

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
   */
  static resetSignals(isDone: WritableSignal<boolean>, isCorrectAnswer: WritableSignal<boolean>, chosenWords: WritableSignal<string[]>) {
    isDone.set(false);
    isCorrectAnswer.set(false);
    chosenWords.set([]);
  }
}
