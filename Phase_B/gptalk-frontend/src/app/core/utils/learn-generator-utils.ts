import { Difficulty } from '../../../models/enums/difficulty.enum';
import { WritableSignal } from '@angular/core';
import { Exercise } from '../../../models/exercise.interface';
import _ from 'lodash';
import { ExerciseType } from '../../../models/enums/exercise-type.enum';
import { Language } from '../../../models/enums/language.enum';

/*
  Contains functions related to lesson generation
 */
export class LearnGeneratorUtils {

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
   * Updates the prompt string with the specified text
   * @param promptString the signal to be updated
   * @param input the text to be added to the signal
   */
  static updatePromptString(promptString: WritableSignal<string>, input: string) {
    promptString.update(data => {
      data += '\n' + input;
      return data;
    });
  }


  /**
   * Converts a JSON object of generated exercises to an array of type Exercise objects
   * @param exercisesJson the JSON object
   * @param language the lesson's selected language
   * @returns an Exercise objects array
   */
  static convertToExerciseArray(exercisesJson: any, language: Language) {
    let exercisesArr: Exercise[] =[];

    for (const key in exercisesJson) {

      if (exercisesJson.hasOwnProperty(key)) {
        // Gets the current ExerciseType using the JSON object's key
        const exerciseType: ExerciseType = <ExerciseType>parseInt(key);

        // Gets the current exercise's data using the JSON object's key
        const exerciseData = exercisesJson[key];

        // Converts the data to an Exercise object
        let exercise: Exercise = {
          type: exerciseType,
          question: exerciseData.question,
          choices: exerciseData.choices,
          correctPairs: exerciseData.correctPairs,
          answer: exerciseData.answer,
          translation: exerciseData.translation
        };

        exercisesArr.push(exercise);
      }
    }
    // Adds exercise-specific data to the exercise array
    exercisesArr = this.addExerciseSpecificData(language, exercisesArr);

    return exercisesArr;
  }

  /**
   * Adds heading and instruction strings to the exercises array
   * @param language the lesson's selected language
   * @param exercises the exercises array
   */
  private static addExerciseSpecificData(language: Language, exercises: Exercise[]) {

    // The heading strings of the available exercise types
    const headingsMap: {[key in ExerciseType]: string } = {
      0: 'Fill in the blank',
      1: 'Choose the correct translation',
      2: 'Translate the sentence',
      3: 'Complete the conversation',
      4: 'Match the words',
      5: 'Arrange the words to form a correct sentence',
      6: 'Match the words to their correct category'
    }

    // The instruction strings of the available exercise types
    const instructionsMap: {[key in ExerciseType]: string } = {
      0: 'Click on an answer or type it and hit the <i>enter</i> key to submit',
      1: 'Click on the correct translation of the given word',
      2: `Write the given sentence in ${language}`,
      3: `Click on an answer or type it and hit the <i>enter</i> key to submit`,
      4: `Match the words in ${language} to their English translations`,
      5: `Click the words sequentially to place them onto the board. Click submit when finished.`,
      6: 'Drag and drop the words to their category container. Click submit when finished.'
    }

    // Adds data according to each exercise object's type
    for (let exercise of exercises) {
      // Adds heading and instruction based on the exercise type
      exercise.heading = headingsMap[exercise.type];
      exercise.instructions = instructionsMap[exercise.type];

      // Randomizes the word order for a matchTheWords exercise
      if (exercise.type === ExerciseType.MatchTheWords) {
        exercise.randomizedPairs = this.shuffleWordPairs(exercise.correctPairs ?? []);
      }
    }
    return exercises;
  }

  /**
   * Shuffles the locations of the left words and the locations of the right words in the array
   * @param wordPairs an array of string pairs. first element in pair - left word.
   *                  Second element in pair - right word
   */
  private static shuffleWordPairs(wordPairs: [string, string][]): [string, string][] {
    const leftWords = wordPairs.map(pair => pair[0]);
    const rightWords = wordPairs.map(pair => pair[1]);

    // Shuffle each array independently
    const shuffledLeftWords = _.shuffle(leftWords);
    const shuffledRightWords = _.shuffle(rightWords);

    // Re-pair the shuffled words
    return shuffledLeftWords.map((leftWord, index) => [leftWord, shuffledRightWords[index]])
  }
}
