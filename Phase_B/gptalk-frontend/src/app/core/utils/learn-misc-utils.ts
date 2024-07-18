import _ from 'lodash';
import { WritableSignal } from '@angular/core';
import { Exercise } from '../../../models/exercise.interface';
import { closest, distance } from 'fastest-levenshtein';
import { Difficulty } from '../../../models/enums/difficulty.enum';

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
   *
   * @param exercise signal containing the current exercise data
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
   * Removes the first element from the exercises array
   * @returns firstElement - the first element in the given exercises array (before the shift)
   * @param exerciseArr the exercises array in signal form
   */
  static exerciseArrShift(exerciseArr: WritableSignal<Exercise[]>) {
    const firstElement = exerciseArr()[0];
    exerciseArr.update(arr => {
      arr.shift();
      return arr;
    });
    return firstElement;
  }

  /**
   * Inserts strings into the keyWords array based on the given difficulty
   * @param difficulty the difficulty level
   * @returns updated keyWords array
   */
  static insertKeyWords(difficulty: Difficulty) {
    const keyWords: string[] = [];
    // Parameters for very easy and easy difficulties
    if (difficulty >= 0 && difficulty < 2) {
      keyWords.push('simple', 'beginners');
    }
    // Parameters for medium and hard difficulties
    else if (difficulty >= 3 && difficulty < 4) {
      keyWords.push('some familiarity with the language');
    }
    // Parameters for very hard and expert difficulties
    else {
      keyWords.push('high level learners', 'challenge');
    }
    return keyWords;
  }

  /**
   * Updates the given signal of type string with the specified text
   * @param stringSignal the signal to be updated
   * @param input the text to be added to the signal
   */
  static updateStringSignal(stringSignal: WritableSignal<string>, input: string) {
    stringSignal.update(data => {
      data += input;
      return data;
    });
  }

  static convertToExerciseArray(data: unknown) {
    let exercises: Exercise[] =[];

    //TODO: assign data to array
    return exercises;
  }
}
