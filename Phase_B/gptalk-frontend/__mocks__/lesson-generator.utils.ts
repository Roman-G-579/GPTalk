import {Exercise} from "../src/app/core/interfaces/exercise.interface";
import {ExerciseType} from "../src/app/core/enums/exercise-type.enum";

// The heading strings of the available exercise types
const HEADINGS_MAP: { [key in ExerciseType]: string } = {
  0: 'Fill in the blank',
  1: 'Choose the correct translation',
  2: 'Translate the sentence',
  3: 'Complete the conversation',
  4: 'Match the words',
  5: 'Arrange the words to form a correct sentence',
  6: 'Match the words to their correct category',
  7: 'Summarize the paragraph',
  8: 'Choose the tense'
};

// The instruction strings of the available exercise types
const INSTRUCTIONS_MAP: { [key in ExerciseType]: string } = {
  0: 'Click on an answer or type it and hit the <i>enter</i> key to submit',
  1: 'Click on the correct translation of the given word',
  2: `Write the given sentence in a given language`,
  3: `Click on an answer or type it and hit the <i>enter</i> key to submit`,
  4: `Match the words in a given language to their English translations`,
  5: `Click the words sequentially to place them onto the board. Click submit when finished.`,
  6: 'Drag and drop the words to their category container. Click submit when finished.',
  7: 'Click on the option that best summarizes the given paragraph',
  8: 'Click on the correct grammatical tense for the given sentence'
};

export class MockLessonGeneratorUtils {

  static getRandomTopic = jest.fn(() => {
    return 'newTopic';
  });

  static convertToExerciseObject = jest.fn((exerciseJson: Exercise, exerciseType: ExerciseType) => {
    return {
      type: exerciseType,
      question: exerciseJson.question,
      cat_a: exerciseJson.cat_a,
      cat_b: exerciseJson.cat_b,
      words_a: exerciseJson.words_a,
      words_b: exerciseJson.words_b,
      choices: exerciseJson.choices,
      correctPairs: exerciseJson.correctPairs,
      answer: exerciseJson.answer,
      translation: exerciseJson.translation,
      translations: exerciseJson.translations,
      heading: HEADINGS_MAP[exerciseType],
      instructions: INSTRUCTIONS_MAP[exerciseType]
    };
  });

  private static addExerciseSpecificData = jest.fn((exercise: Exercise) => {
    exercise.heading = HEADINGS_MAP[exercise.type];
    exercise.instructions = INSTRUCTIONS_MAP[exercise.type];
    return exercise;
  });

  private static setFillInTheBlank = jest.fn((exercise: Exercise) => {
    exercise.sentenceBeforeBlank = 'mocked before';
    exercise.sentenceAfterBlank = 'mocked after';
    exercise.choices = ['mocked', 'choices'];
    exercise.answer = 'mocked';
    return exercise;
  });

  private static setTranslateWord = jest.fn((exercise: Exercise) => {
    exercise.question = 'mocked question';
    exercise.choices = ['mocked translation1', 'mocked translation2'];
    exercise.answer = 'mocked translation1';
    return exercise;
  });

  private static setCompleteTheConversation = jest.fn((exercise: Exercise) => {
    exercise.choices = ['mocked choice1', 'mocked choice2'];
    exercise.answer = 'mocked choice1';
    return exercise;
  });

  private static setMatchTheWords = jest.fn((exercise: Exercise) => {
    exercise.randomizedPairs = [['mocked word1', 'mocked word2']];
    return exercise;
  });

  private static setReorderSentence = jest.fn((exercise: Exercise) => {
    exercise.choices = ['mocked word1', 'mocked word2'];
    return exercise;
  });

  private static setMatchTheCategory = jest.fn((exercise: Exercise) => {
    exercise.choices = ['mocked category1', 'mocked category2'];
    return exercise;
  });

  private static shuffleWordPairs = jest.fn((wordPairs: [string, string][]) => {
    return wordPairs.map(([left, right]) => [right, left]); // Mock shuffle by swapping
  });
}
