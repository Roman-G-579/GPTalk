import { signal, WritableSignal } from '@angular/core';
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
    if (exercise().correctWordPairs?.some(([left,right]) => left == leftWord && right == rightWord)) {

      // Update the result pairs array to reflect the found match (used to highlight a correct match on the screen)
      matchResults.update(data => {
        // Get the indices of both matching words in the words array
        const leftIdx = exercise().randomizedWordPairs?.findIndex(([left,]) => left == leftWord) ?? -1;
        const rightIdx = exercise().randomizedWordPairs?.findIndex(([,right]) => right == rightWord) ?? -1;

        // Update the match results array at the corresponding indices
        if (leftIdx != -1 && rightIdx != -1) {
          data[leftIdx][0] = true;
          data[rightIdx][1] = true;
        }
        return data;
      });

      // If all booleans in the match results array are 'true', the exercise is complete
      return !matchResults().some(([left, right]) => !left || !right);
    }
    else {
      // this.matchMistakesCnt.set(this.matchMistakesCnt() + 1);
      return false;
      // TODO: for each mistake deduct exp reward of current exercise
    }
  }

}
