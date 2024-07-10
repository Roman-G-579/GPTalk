import { WritableSignal } from '@angular/core';
import { Exercise } from '../../../models/exercise.interface';
import { ExerciseType } from '../../../models/enums/exercise-type.enum';
import { distance } from 'fastest-levenshtein';
import { LearnMiscUtils as util } from './learn-misc-utils';

/**
 * Contains functions related to answer verifications
 */
export class LearnVerificationUtils {

  /**
   * Compares the user's chosen answer with the exercise's actual answer
   * If the answer was manually entered, the string is used in the comparison
   *
   * Used by exercise types: FillInTheBlank, TranslateWord, TranslateTheSentence, CompleteTheConversation
   * @param answer  the answer submitted by the user for verification
   * @param exercise the data of the currently active exercise
   */
  static verifyAnswer(answer: string, exercise: WritableSignal<Exercise>) {
    // Normalizing the user's answer and the actual answer, removing any punctuation marks
    answer = answer.toLowerCase().trim().replace(/[,.!?:]/g,'').normalize();
    const actualAnswer = exercise().answer?.replace(/[,.!?:]/g,'') ?? "";

    // Exact answer
    if (answer == actualAnswer) return true;

    // Close match (3 or fewer characters apart)
    // (Exclusive to TranslateTheSentence exercise)
    if(exercise().type == ExerciseType.TranslateTheSentence && distance(answer, actualAnswer) < 4) {
      return true;
    }

    // Approximate the answer if it was submitted by manually typing it
    // (Done only in exercises where a single word is evaluated)
    // and compare it to the actual answer
    else return util.findClosestString(answer, exercise) == actualAnswer;
  }

  /**
   * Checks if the chosen pair matches a pair in the answer array
   * If the pair is a match, returns "matchFound"
   * If the pair is not a match, returns "wrongMatch"
   * If the pair is the final match, returns "allMatchesFound"
   *
   * Used by exercise types: MatchTheWords
   * @param chosenPair the signal containing the currently chosen pair ow words
   * @param matchResults the signal containing the states of the word matches in the current exercises
   * @param exercise the data of the currently active exercise
   */
  static verifyMatch(chosenPair: WritableSignal<[string,string]>, matchResults: WritableSignal<[boolean,boolean][]>, exercise: WritableSignal<Exercise>) {
    const leftWord = chosenPair()[0];
    const rightWord = chosenPair()[1];

    // If the correct pairs array includes the pair [leftWord, rightWord], a match has been found
    if (exercise().correctPairs?.some(([left,right]) => left == leftWord && right == rightWord)) {

      // Update the result pairs array to reflect the found match (used to highlight a correct match on the screen)
      matchResults.update(data => {
        // Get the indices of both matching words in the words array
        const leftIdx = exercise().randomizedPairs?.findIndex(([left,]) => left == leftWord) ?? -1;
        const rightIdx = exercise().randomizedPairs?.findIndex(([,right]) => right == rightWord) ?? -1;

        // Update the match results array at the corresponding indices
        if (leftIdx != -1 && rightIdx != -1) {
          data[leftIdx][0] = true;
          data[rightIdx][1] = true;
        }
        return data;
      });

      // If all booleans in the match results array are 'true', the exercise is complete
      if (!matchResults().some(([left, right]) => !left || !right)) {
        return "allMatchesFound";
      }
      else {
        return "matchFound"
      }
    }

      // this.matchMistakesCnt.set(this.matchMistakesCnt() + 1);
      return "wrongMatch";
      // TODO: for each mistake deduct exp reward of current exercise

  }

  /**
   * Checks if all words were matched to the correct categories
   *
   * Used by exercise types: MatchTheCategory
   * @param categoryMatches the signal containing the categories and the categorized word arrays
   * @param exercise the data of the currently active exercise
   */
  static verifyCategories(
    categoryMatches: WritableSignal<{categories: [string,string], wordBank: string[], cat1: string[], cat2: string[]}>,
    exercise: WritableSignal<Exercise>)
  {
    const correctPairsArr = exercise().correctPairs ?? [];

    // Creates a map from the pairs array: key - word, value - word's category
    const correctPairsMap = new Map(correctPairsArr.map(([word, category]) => [word, category]));

    // Checks if all elements in a given array appear with the correct category in correctPairsMap
    const checkCategory = (arr: string[], category: string) => arr.every(item => correctPairsMap.get(item) === category);

    // Calls the checkCategory method to verify the word placements in the arrays
    const isCat1Correct = checkCategory(categoryMatches().cat1, categoryMatches().categories[0]);
    const isCat2Correct = checkCategory(categoryMatches().cat2, categoryMatches().categories[1]);

    return isCat1Correct && isCat2Correct;
  }

}
