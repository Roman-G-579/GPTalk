import {WritableSignal} from "@angular/core";
import {Exercise} from "../src/app/core/interfaces/exercise.interface";

export class MockMiscUtils {
  /**
   * Mock implementation for lowerCaseAndNormalizeAll
   */
  static lowerCaseAndNormalizeAll = jest.fn((exercise: WritableSignal<Exercise>) => {
    // Simulate the normalization behavior in a simplified way
    exercise.update(data => {
      data.question = data.question?.toLowerCase();
      data.answer = data.answer?.toLowerCase();
      data.choices = data.choices?.map((elem) => elem.toLowerCase());
      data.correctPairs = data.correctPairs?.map((pair) => [pair[0].toLowerCase(), pair[1].toLowerCase()]);
      data.randomizedPairs = data.randomizedPairs?.map((pair) => [pair[0].toLowerCase(), pair[1].toLowerCase()]);
      return data;
    });
  });

  /**
   * Mock implementation for findClosestString
   */
  static findClosestString = jest.fn((str: string, exercise: WritableSignal<Exercise>) => {
    // Return a mock result or simplified logic for testing
    if (!exercise().answer?.startsWith(str[0])) {
      return "";
    }
    return "mockClosestString";
  });

  /**
   * Mock implementation for exerciseArrShift
   */
  static exerciseArrShift = jest.fn((exerciseArr: WritableSignal<Exercise[]>) => {

    const firstElement = exerciseArr()[0];
    exerciseArr.update((arr) => {
      arr.shift();
      return arr;
    });
    return firstElement;
  });

  /**
   * Mock implementation for calculateExpForNextLevel
   */
  static calculateExpForNextLevel = jest.fn((level: number) => {

    return 100 * Math.pow(2, level - 1);
  });

  /**
   * Mock implementation for calculateLevel
   */
  static calculateLevel = jest.fn((totalExp: number) => {
    if (totalExp < 100) return 1;
    return Math.floor(Math.log2(totalExp / 100) + 1) + 1;
  });
}
