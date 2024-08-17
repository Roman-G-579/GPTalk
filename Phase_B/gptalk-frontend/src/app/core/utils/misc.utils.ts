import _ from 'lodash';
import { WritableSignal } from '@angular/core';
import { Exercise } from '../interfaces/exercise.interface';
import { closest, distance } from 'fastest-levenshtein';
import { Difficulty } from '../enums/difficulty.enum';

/**
 * Contains miscellaneous utility functions
 */
export class MiscUtils {

  /**
   * Converts every question and answer related string to normalized and lowercase for easier comparisons
   *
   * @param exercise signal containing the current exercise data
   */
  static lowerCaseAndNormalizeAll(exercise: WritableSignal<Exercise>) {
    exercise.update( data => {
      data.question = data.question?.normalize().toLowerCase();
      data.answer = data.answer?.normalize().toLowerCase();
      data.choices = data.choices?.map(elem => elem.normalize().replace(/[,.!?:]/g,'').toLowerCase());
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
   * Calculates the required amount of experience points
   * needed for the next level, based on the user's current level
   */
  static calculateExpForNextLevel(level: number){
    return (100 * Math.pow(2, level-1));
  }

  /**
   * Calculates the user's current level based on his total amount of experience points
   * @param totalExp the user's exp points
   */
  static calculateLevel(totalExp: number) {
    if (totalExp < 100) return 1;

    return Math.floor(Math.log2(totalExp / 100) + 1) + 1;
  }

}
