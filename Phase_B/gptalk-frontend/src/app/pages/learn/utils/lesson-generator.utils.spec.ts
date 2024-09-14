import {LessonGeneratorUtils} from './lesson-generator.utils';
import {Exercise} from "../../../core/interfaces/exercise.interface";
import {ExerciseType} from "../../../core/enums/exercise-type.enum";
import _ from "lodash";
import {LearnInitializerUtils} from "./learn-initializer.utils";

describe('LessonGeneratorUtils', () => {
  afterEach(() => {
    jest.spyOn(global.Math, 'random').mockRestore();
  });


  describe('getRandomTopic', () => {
    it('should get a random topic and replace the existing one', () => {
      let topic = 'oldTopic'
      topic = LessonGeneratorUtils.getRandomTopic();

      expect(topic).not.toEqual('oldTopic');
    });
  });

  describe('setFillInTheBlank', () => {
    let exercise: Exercise;

    beforeEach(() => {
      exercise = {
        type: ExerciseType.FillInTheBlank,
        answer: 'הטיסה ממריאה מחר בבוקר',
        choices: ["חתול","קפה","לרוץ"],
        sentenceBeforeBlank: '',
        sentenceAfterBlank: ''
      };
    });

    it('should correctly process a valid exercise input', () => {
      const updatedExercise = LessonGeneratorUtils['setFillInTheBlank'](exercise);

      expect(updatedExercise.sentenceBeforeBlank).toBeDefined();
      expect(updatedExercise.sentenceAfterBlank).toBeDefined();
      expect(updatedExercise.answer).toBeDefined();
      expect(updatedExercise.choices).toContain(updatedExercise.answer);
    });

    it('should handle an empty choices array correctly', () => {
      exercise.choices = [];

      const updatedExercise = LessonGeneratorUtils['setFillInTheBlank'](exercise);

      expect(updatedExercise.choices).toHaveLength(1); // Only the random word inserted
      expect(updatedExercise.choices).toContain(updatedExercise.answer);
    });

    it('should insert the random word at a random position in the choices array', () => {
      const originalChoicesArray = exercise.choices ?? [];
      const originalLength = originalChoicesArray.length;

      const updatedExercise = LessonGeneratorUtils['setFillInTheBlank'](exercise);

      // Ensure a word was added
      expect(updatedExercise.choices).toHaveLength(originalLength + 1);

      // Ensure the word is in the choices array
      expect(updatedExercise.choices).toContain(updatedExercise.answer);
    });
  });

  describe('setTranslateWord', () => {
    let exercise: Exercise;

    beforeEach(() => {
      exercise = {
        type: ExerciseType.TranslateWord,
        choices: ["מכונית", "ספר", "שולחן", "תפוח"],
        translations: ["car", "book", "table", "apple"],
        question: '',
        answer: ''
      };
    });

    it('should correctly update the exercise with a random choice', () => {
      const updatedExercise = LessonGeneratorUtils['setTranslateWord'](exercise);

      expect(updatedExercise.question).toBeDefined();
      expect(updatedExercise.choices).toEqual(exercise.translations);
      expect(updatedExercise.answer).toBeDefined();
      expect(updatedExercise.translations).toContain(updatedExercise.answer);
    });

    it('should properly handle empty choices and translations arrays', () => {
      exercise.choices = [];
      exercise.translations = [];

      const updatedExercise = LessonGeneratorUtils['setTranslateWord'](exercise);

      expect(updatedExercise.question).toBeUndefined();
      expect(updatedExercise.choices).toEqual([]);
      expect(updatedExercise.answer).toBeUndefined();
    });
  });

  describe('setCompleteTheConversation', () => {
    let exercise: Exercise;

    beforeEach(() => {
      exercise = {
        type: ExerciseType.CompleteTheConversation,
        question: "מתי אתה מתכנן לסיים את הפרויקט?",
        choices:  ["אני מתכנן לסיים את הפרויקט בסוף השבוע.", "אני מתכננים לסיים את הפרויקט בסוף השבוע."],
        answer: '',
      };
    });

    it('should remove punctuation from all choices', () => {
      const updatedExercise = LessonGeneratorUtils['setCompleteTheConversation'](exercise);

      expect(updatedExercise.choices).toEqual(
        expect.arrayContaining( ["אני מתכנן לסיים את הפרויקט בסוף השבוע", "אני מתכננים לסיים את הפרויקט בסוף השבוע"])
      );
    });

    it('should set the first choice as the answer', () => {
      const updatedExercise = LessonGeneratorUtils['setCompleteTheConversation'](exercise);

      expect(updatedExercise.answer).toBe('אני מתכנן לסיים את הפרויקט בסוף השבוע');
    });

    it('should properly handle empty choices', () => {
      exercise.choices = ["",""];
      const updatedExercise = LessonGeneratorUtils['setCompleteTheConversation'](exercise);

      expect(updatedExercise.choices).toEqual(["",""]);
      expect(updatedExercise.answer).toBe("");
    });
  });

  describe('setReorderSentence', () => {
    let exercise: Exercise;

    beforeEach(() => {
      exercise = {
        type: ExerciseType.ReorderSentence,
        answer: "הילד הלך לבית הספר עם חבריו.",
        translation: "The boy went to school with his friends.",
        choices: []
      };
    });

    it('should shuffle the words in the answer and set them as choices', () => {
      const updatedExercise = LessonGeneratorUtils['setReorderSentence'](exercise);

      const expectedChoices = exercise.answer?.split(' ') ?? [];
      const shuffledChoices = _.shuffle(expectedChoices);

      // Check if the updated choices are a permutation of the original answer words
      expect(updatedExercise.choices).toEqual(expect.arrayContaining(shuffledChoices));
      expect(updatedExercise.choices?.length).toBe(shuffledChoices.length);
    });

    it('should properly handle an empty answer', () => {
      exercise.answer = '';
      const updatedExercise = LessonGeneratorUtils['setReorderSentence'](exercise);

      expect(updatedExercise.choices).toEqual([]);
    });

    it('should properly handle an undefined answer', () => {
      exercise.answer = undefined;
      const updatedExercise = LessonGeneratorUtils['setReorderSentence'](exercise);

      expect(updatedExercise.choices).toEqual([]);
    });
  });

  describe('setMatchTheCategory', () => {
    let exercise: Exercise;

    beforeEach(() => {
      exercise = {
        type: ExerciseType.MatchTheCategory,
        choices: []
      };
    });

    it('should combine words_a and words_b, shuffle them, and set them as choices', () => {
      exercise.words_a = ['apple', 'banana'];
      exercise.words_b = ['cat', 'dog'];

      const updatedExercise = LessonGeneratorUtils['setMatchTheCategory'](exercise);

      const combinedWords = [...exercise.words_a, ...exercise.words_b];
      const shuffledWords = _.shuffle(combinedWords);

      expect(updatedExercise.choices).toEqual(expect.arrayContaining(shuffledWords));
      expect(updatedExercise.choices?.length).toBe(shuffledWords.length);
    });

    it('should handle empty words_a and words_b correctly', () => {
      exercise.words_a = [];
      exercise.words_b = [];

      const updatedExercise = LessonGeneratorUtils['setMatchTheCategory'](exercise);

      expect(updatedExercise.choices).toEqual([]);
    });

    it('should handle when words_a is empty and words_b is populated', () => {
      exercise.words_a = [];
      exercise.words_b = ['cat', 'dog'];

      const updatedExercise = LessonGeneratorUtils['setMatchTheCategory'](exercise);

      exercise.words_b.forEach(word => {
        expect(updatedExercise.choices).toContain(word);
      });
    });

    it('should handle when words_b is empty and words_a is populated', () => {
      exercise.words_a = ['cat', 'dog'];
      exercise.words_b = [];

      const updatedExercise = LessonGeneratorUtils['setMatchTheCategory'](exercise);

      exercise.words_a.forEach(word => {
        expect(updatedExercise.choices).toContain(word);
      });
    });

    it('should handle when words_a and words_b are both undefined', () => {
      exercise.words_a = undefined;
      exercise.words_b = undefined;

      const updatedExercise = LessonGeneratorUtils['setMatchTheCategory'](exercise);

      expect(updatedExercise.choices).toEqual([]);
    });
  });

  describe('summarizeTheParagraph', () => {
    let exercise: Exercise;

    beforeEach(() => {
      exercise = {
        type: ExerciseType.SummarizeTheParagraph,
        choices: ["correct summary", "wrong summary"],
        translation: "translation",
        prompt: 'long paragraph',
        answer: ''
      };
    });

    it('should trim choices to a maximum of 2', () => {
      const updatedExercise = LessonGeneratorUtils['setSummarizeTheParagraph'](exercise);

      expect(updatedExercise.choices?.length).toBe(2);
      expect(updatedExercise.choices).toEqual(expect.arrayContaining(['correct summary', 'wrong summary']));
    });

    it('should set the answer to the first choice', () => {
      const updatedExercise = LessonGeneratorUtils['setSummarizeTheParagraph'](exercise);

      expect(updatedExercise.answer).toBe('correct summary');
    });

    it('should handle empty choices gracefully', () => {
      exercise.choices = [];

      const updatedExercise = LessonGeneratorUtils['setSummarizeTheParagraph'](exercise);

      expect(updatedExercise.choices).toEqual([]);
      expect(updatedExercise.answer).toEqual('');
    });
  });

  describe('chooseTheTense', () => {
    let exercise: Exercise;

    beforeEach(() => {
      exercise = {
        type: ExerciseType.SummarizeTheParagraph,
        choices: ["correct summary", "wrong summary"],
        translation: "הטסט יעבור",
        question: 'The test will pass',
        answer: 'future'
      };
    });
    it('should use the answer if it is a valid tense', () => {
    const result = LessonGeneratorUtils['setChooseTheTense'](exercise);

    expect(result.answer).toBe('future');
    });

    it('should call getSentenceTense if the answer is not a valid tense', () => {
      exercise.answer = 'random text';

      const result = LessonGeneratorUtils['setChooseTheTense'](exercise);

      expect(result.answer).toBe('future');
    });

    it('should handle empty answers', () => {
      exercise.answer = '';

      const result = LessonGeneratorUtils['setChooseTheTense'](exercise);

      expect(result.answer).toBe('future');
    });

    it('should handle missing question and translation', () => {
      exercise.question = '';
      exercise.translation = '';

      const result = LessonGeneratorUtils['setChooseTheTense'](exercise);

      expect(result.answer).toBe('future');
    });
  });

  describe('shuffleWordPairs', () => {
    it('should return an empty array when given an empty input', () => {
      const result = LessonGeneratorUtils['shuffleWordPairs']([]);

      expect(result).toEqual([]);
    });

    it('should handle a single word pair correctly', () => {
      const wordPairs: [string, string][] = [['hello', 'שלום']];
      const result = LessonGeneratorUtils['shuffleWordPairs'](wordPairs);

      expect(result).toEqual([['hello', 'שלום']]); // Single pair should remain the same
    });

    it('should shuffle left and right words independently', () => {
      const wordPairs: [string, string][] = [
          ["מכונית", "car"],
          ["בית", "house"],
          ["חתול", "cat"]
        ];
      const result = LessonGeneratorUtils['shuffleWordPairs'](wordPairs);

      // Check that the result has the same length
      expect(result).toHaveLength(wordPairs.length);

      // Check that each pair in the result has the same words as the input
      const inputLeftWords = wordPairs.map(pair => pair[0]);
      const inputRightWords = wordPairs.map(pair => pair[1]);

      const outputLeftWords = result.map(pair => pair[0]);
      const outputRightWords = result.map(pair => pair[1]);

      // Verify that the output contains the same elements
      expect(outputLeftWords.sort()).toEqual(inputLeftWords.sort());
      expect(outputRightWords.sort()).toEqual(inputRightWords.sort());
    });

    it('should maintain the length of the input array', () => {
      const wordPairs: [string, string][] = [
        ["מכונית", "car"],
        ["בית", "house"],
        ["חתול", "cat"]
      ];
      const result = LessonGeneratorUtils['shuffleWordPairs'](wordPairs);

      expect(result.length).toBe(wordPairs.length);
    });
  });

  describe('getSentenceTense', () => {
    let sentence1: string;
    let sentence2: string;

    beforeEach(() => {
      sentence1 = "the day was long"
      sentence2 = "היום היה ארוך"
    });

    it('should return "past" when sentence contains past tense', () => {
      const result = LessonGeneratorUtils['getSentenceTense'](sentence1, sentence2);

      expect(result).toBe("past");
    });

    it('should return "present" when sentence contains present tense', () => {
      sentence1 = "the day is long";

      const result = LessonGeneratorUtils['getSentenceTense'](sentence1, sentence2);

      expect(result).toBe("present");
    });

    it('should return "future" when sentence contains future tense', () => {
      sentence1 = "the day will be long";

      const result = LessonGeneratorUtils['getSentenceTense'](sentence1, sentence2);

      expect(result).toBe("future");
    });

    it('should default to "present" if no tense is detected', () => {
      sentence1 = "blablabla";

      const result = LessonGeneratorUtils['getSentenceTense'](sentence1, sentence2);

      expect(result).toBe("present");
    });
  });

});
