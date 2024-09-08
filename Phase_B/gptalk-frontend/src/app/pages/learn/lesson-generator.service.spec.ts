import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { LessonGeneratorService } from './lesson-generator.service';
import { of } from 'rxjs';
import {Language} from "../../core/enums/language.enum";
import {Difficulty} from "../../core/enums/difficulty.enum";
import {Exercise} from "../../core/interfaces/exercise.interface";
import {LessonGeneratorUtils} from "./utils/lesson-generator.utils";
import {ExerciseType} from "../../core/enums/exercise-type.enum";
import {environment} from "../../../environments/environment";

jest.mock('./utils/lesson-generator.utils');

describe('LessonGeneratorService', () => {
  let lessonGeneratorService: LessonGeneratorService;
  let httpMock: HttpTestingController;

  let language: Language;
  let difficulty: Difficulty;
  let keyWords: string[];

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [LessonGeneratorService],
    });

    lessonGeneratorService = TestBed.inject(LessonGeneratorService);
    httpMock = TestBed.inject(HttpTestingController);

    // Initialize variables for all tests
    language = Language.English;
    difficulty = Difficulty.Novice;
    keyWords = ['technology'];
  });

  afterEach(() => {
    httpMock.verify();
  });

  function getPromptMocks() {
    jest.spyOn(lessonGeneratorService, 'generateFillInTheBlank').mockReturnValue('mockExercise_FillInTheBlank');
    jest.spyOn(lessonGeneratorService, 'generateTranslateWord').mockReturnValue('mockExercise_TranslateWord');
    jest.spyOn(lessonGeneratorService, 'generateTranslateTheSentence').mockReturnValue('mockExercise_TranslateTheSentence');
    jest.spyOn(lessonGeneratorService, 'generateCompleteTheConversation').mockReturnValue('mockExercise_CompleteTheConversation');
    jest.spyOn(lessonGeneratorService, 'generateMatchTheWords').mockReturnValue('mockExercise_MatchTheWords');
    jest.spyOn(lessonGeneratorService, 'generateReorderSentence').mockReturnValue('mockExercise_ReorderSentence');
    jest.spyOn(lessonGeneratorService, 'generateMatchTheCategory').mockReturnValue('mockExercise_MatchTheCategory');
  }
  describe('generateLesson', () => {
    it('should generate the specified number of exercises', () => {
      const amount = 3;

      const mockExercise: Exercise = {
        type: ExerciseType.TranslateWord,
        choices: ["מכונית", "ספר", "שולחן", "תפוח"],
        translations: ["car", "book", "table", "apple"]
      }

      jest.spyOn(LessonGeneratorUtils, 'insertKeyWords').mockReturnValue(['technology', 'simple', 'beginners']);

      getPromptMocks();

      jest.spyOn(LessonGeneratorUtils, 'convertToExerciseObject').mockReturnValue(mockExercise);
      jest.spyOn(lessonGeneratorService, 'getExerciseFromApi').mockReturnValue(of(mockExercise));

      lessonGeneratorService.generateLesson(language, difficulty, amount).subscribe((result) => {

        expect(result.length).toBe(amount);
      });
    });

    it('should handle the exercise generation correctly', () => {
      const amount = 2;
      const mockExercise: Exercise = {
        type: ExerciseType.TranslateWord,
        choices: ["מכונית", "ספר", "שולחן", "תפוח"],
        translations: ["car", "book", "table", "apple"]
      }

      jest.spyOn(LessonGeneratorUtils, 'insertKeyWords').mockReturnValue(['simple', 'beginners']);

      getPromptMocks();

      jest.spyOn(LessonGeneratorUtils, 'convertToExerciseObject').mockReturnValue(mockExercise);
      jest.spyOn(lessonGeneratorService, 'getExerciseFromApi').mockReturnValue(of(mockExercise));

      lessonGeneratorService.generateLesson(language, difficulty, amount).subscribe((exercises) => {

        expect(exercises[0]).toEqual(mockExercise);
      });
    });
  });

  describe('generateFillInTheBlank', () => {
    it('should generate a correct prompt format for valid input', () => {
      const result = lessonGeneratorService.generateFillInTheBlank(language, difficulty, keyWords);

      // Check the output format
      expect(result).toMatch(`generate an object in English, Novice difficulty. 'answer' is the sentence, 'translation' is its english translation, 'choices' is 3 random words, not found in "answer". Focus on topics: technology. {"answer": "", "choices:" [], "translation": ""}`);
    });
  });

  describe('generateTranslateWord', () => {
    it('should generate a correct prompt format for valid input', () => {
      const result = lessonGeneratorService.generateTranslateWord(language,difficulty,keyWords);

      expect(result).toMatch(`generate word array, difficulty: Novice, language: English. number of words: 3. Focus on topics: technology. {"choices": [array_of_words] "translations": [array_of_translations] }`);
    });
  });

  describe('generateTranslateTheSentence', () => {
    it('should generate a correct prompt format for valid input', () => {
      const result = lessonGeneratorService.generateTranslateTheSentence(language,difficulty,keyWords);

      expect(result).toMatch(`generate a "translate the sentence" exercise, difficulty: Novice. Focus on topics: technology. {"question": "english_sentence", "answer": "English_translation"}`);
    });
  });

  describe('generateCompleteTheConversation', () => {
    it('should generate a correct prompt format for valid input', () => {
      const result = lessonGeneratorService.generateCompleteTheConversation(language,difficulty,keyWords);

      expect(result).toMatch(`generate a "complete the conversation" exercise, difficulty: Novice, language: English. First choice is grammatically correct and makes sense, second choice doesn't. Focus on topics: technology. { "question": "question/statement", "choices": ["reply1","reply2"] "translation": "english_translation_of_question_&_correct_reply" }`);
    });
  });

  describe('generateMatchTheWords', () => {
    it('should generate a correct prompt format for valid input', () => {
      const result = lessonGeneratorService.generateMatchTheWords(language,difficulty,keyWords);

      expect(result).toMatch(`Generate an array of word pairs in English, Novice difficulty. 4 pairs. Focus on topics: technology. Follow this json structure: "correctPairs": { ["word","translation"] }`);
    });
  });

  describe('generateReorderSentence', () => {
    it('should generate a correct prompt format for valid input', () => {
      const result = lessonGeneratorService.generateReorderSentence(language,difficulty,keyWords);

      expect(result).toMatch(`generate a 4 words long sentence, in English, Novice difficulty. Focus on topics: technology { "answer": "", "translation": "" }`);
    });
  });

  describe('generateMatchTheCategory', () => {
    it('should generate a correct prompt format for valid input', () => {
      const result = lessonGeneratorService.generateMatchTheCategory(language,difficulty,keyWords);

      expect(result).toMatch(`Generate 2 distinct categories and 4 words for each, in English, Novice difficulty. Focus on topics: technology Ensure the response is strictly in the following JSON format: { "cat_a": "", "cat_b": "", "words_a": [], "words_b": [] }. Do not include any additional keys.`);
    });
  });

  describe('getExerciseFromApi', () => {
    it('should send a POST request with the correct prompt string', () => {
      const promptString = 'Test prompt';
      const expectedResponse = { success: true }; // Example response from the backend

      lessonGeneratorService.getExerciseFromApi(promptString).subscribe((response) => {
        expect(response).toEqual(expectedResponse);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}generateLesson`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ userPrompt: promptString });

      // Simulate the response from the backend
      req.flush(expectedResponse);
    });

    it('should handle error response from the backend', () => {
      const promptString = 'Test prompt';
      const expectedResponse = { success: false };

      lessonGeneratorService.getExerciseFromApi(promptString).subscribe({
        next: (response) => {
          expect(response).toEqual(expectedResponse);
        },
        error: () => fail('Should not have called error callback'),
      });

      const req = httpMock.expectOne(`${environment.apiUrl}generateLesson`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ userPrompt: promptString });

      // Simulate an error response from the backend
      req.flush('Error message', { status: 500, statusText: 'Internal Server Error' });
    });
  });

});
