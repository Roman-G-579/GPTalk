import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Language } from '../../core/enums/language.enum';
import { Difficulty } from '../../core/enums/difficulty.enum';
import { Exercise } from '../../core/interfaces/exercise.interface';
import { LessonGeneratorUtils as genUtil } from './utils/lesson-generator.utils';
import { forkJoin, map, Observable, of } from 'rxjs';
import { ExerciseType } from '../../core/enums/exercise-type.enum';
import { cloneDeep } from 'lodash';

@Injectable({
  providedIn: 'root'
})
export class LessonGeneratorService {
  private readonly apiUrl = environment.apiUrl;
  private readonly http = inject(HttpClient);

  // mockExercise_FillInTheBlank: Exercise = {
  //   type: ExerciseType.FillInTheBlank,
  //   answer: "הטיסה ממריאה מחר בבוקר",
  //   choices: ["חתול","קפה","לרוץ"],
  //   translation: "The flight takes off tomorrow"
  // }
  //
  // mockExercise_TranslateWord: Exercise = {
  //   type: ExerciseType.TranslateWord,
  //   choices: ["מכונית", "ספר", "שולחן", "תפוח"],
  //   translations: ["car", "book", "table", "apple"]
  // }
  //
  // mockExercise_TranslateSentence: Exercise = {
  //   type: ExerciseType.TranslateTheSentence,
  //   question: "קוראים לי דני",
  //   answer: "My name is Danny"
  // }
  //
  // mockExercise_CompleteTheConversation: Exercise = {
  //   type: ExerciseType.CompleteTheConversation,
  //   question: "מתי אתה מתכנן לסיים את הפרויקט?",
  //   choices: ["אני מתכנן לסיים את הפרויקט בסוף השבוע.", "אני מתכננים לסיים את הפרויקט בסוף השבוע."],
  //   translation: "When do you plan to finish the project? / I plan to finish the project by the end of the week."
  // }
  //
  mockExercise_MatchTheWords: Exercise = {
    type: ExerciseType.MatchTheWords,
    "correctPairs": [
      ["מכונית", "car"],
      ["בית", "house"],
      ["חתול", "cat"],
    ]
  }

  // mockExercise_MatchTheWords: Exercise = {
  //   type: ExerciseType.MatchTheWords,
  //   "correctPairs": [
  //     ["מכונית", "car"],
  //     ["בית", "house"],
  //     ["חתול", "cat"],
  //     ["עץ", "tree"],
  //     ["ספר", "book"]
  //   ]
  // }
  //
  // mockExercise_ReorderSentence: Exercise = {
  //   type: ExerciseType.ReorderSentence,
  //   "answer": "הילד הלך לבית הספר עם חבריו.",
  //   "translation": "The boy went to school with his friends."
  // }
  //
  // mockExercise_MatchTheCategory: Exercise = {
  //   type: ExerciseType.MatchTheCategory,
  //   "cat_a": "חיות",
  //   "cat_b": "פירות",
  //   "words_a": ["כלב", "חתול", "זאב" ,"סוס"],
  //   "words_b": ["תפוח", "בננה","ענבים" ,"תפוז"]
  // }

  /**
   * Generates the specified amount of random exercises by calling OpenAI's API
   *
   * @param language the language of the generated exercise
   * @param difficulty difficulty the difficulty level
   * @param amount the amount of exercises to be generated
   * @returns the exercises observable
   */
  generateLesson(language: Language, difficulty: Difficulty, amount: number): Observable<Exercise[]> {
    let keyWords = genUtil.insertKeyWords(difficulty); // Insert special keywords for the api based on the difficulty

    // All functions that can be called to generate an exercise
    const exerciseGenerators = [
      this.generateFillInTheBlank.bind(this),
      this.generateTranslateWord.bind(this),
      this.generateTranslateTheSentence.bind(this),
      this.generateCompleteTheConversation.bind(this),
      this.generateMatchTheWords.bind(this),
      this.generateReorderSentence.bind(this),
      this.generateMatchTheCategory.bind(this)
    ];

    // Stores the observables returned by the exercise generators
    const exerciseObservables: Observable<Exercise>[] = [];

    for (let i = 0; i < amount; i++) {
      // Choose a random exercise index
      // const randomIndex: number = Math.floor(Math.random() * exerciseGenerators.length);
      const randomIndex: number = 4;

      // The Chosen function
      const generatorFunc = exerciseGenerators[randomIndex];

      // Generate an exercise prompt based on the randomized exercise index
      const exercisePrompt = generatorFunc(language,difficulty,keyWords);

      // Get JSON object from API and convert it to an Exercise object
      const exerciseObservable = this.getExerciseFromApi(exercisePrompt).pipe(
        map(response => {
          const exerciseType = <ExerciseType>(randomIndex); // Sets the generated exercise's type
          return genUtil.convertToExerciseObject(response as Exercise, exerciseType, language);
        })
      );

      // Add the exercise to the observables array
      exerciseObservables.push(exerciseObservable);

      keyWords = genUtil.changeTopicKeyWord(keyWords); // Randomizes a topic for the next exercise
    }

    return forkJoin(exerciseObservables);
  }

  /**
   * Creates a query for the API to generate a "fill in the blanks" exercise, using the given parameters
   * @param language the language of the generated exercise
   * @param difficulty the exercise's difficulty level
   * @param keyWords a string array of keywords that are sent to the API to narrow the generated results
   */
  generateFillInTheBlank(language: Language, difficulty: Difficulty, keyWords: string[]): string {
    // Exercise-specific parameters
    let numOfAnswers: number;

    // Parameters for very easy and easy difficulties
    if (difficulty == 0) {
      numOfAnswers = 3;
    }
    // Parameters for medium and hard difficulties
    else if (difficulty == 1) {
      numOfAnswers = 4;
    }
    // Parameters for very hard and expert difficulties
    else {
      numOfAnswers = 5;
    }

    return `generate an object in ${language}, ${Difficulty[difficulty]} difficulty. 'answer' is the sentence, 'translation' is its english translation, 'choices' is ${numOfAnswers} random words, not found in "answer". Focus on topics: ${keyWords[0]}. {"answer": "", "choices:" [], "translation": ""}`;
  }

  /**
   * Creates a query for the API to generate a "translate words" exercise, using the given parameters
   * @param language the language of the generated exercise
   * @param difficulty the exercise's difficulty level
   * @param keyWords a string array of keywords that are sent to the API to narrow the generated results
   */
  generateTranslateWord(language: Language, difficulty: Difficulty, keyWords: string[]): string {
    // Exercise-specific parameters
    let numOfAnswers: number;

    // Parameters for very easy and easy difficulties
    if (difficulty == 0) {
      numOfAnswers = 3;
    }
    // Parameters for medium and hard difficulties
    else if (difficulty == 1) {
      numOfAnswers = 4;
    }
    // Parameters for very hard and expert difficulties
    else {
      numOfAnswers = 5;
    }

    return `generate word array, difficulty: ${Difficulty[difficulty]}, language: ${language}. number of words: ${numOfAnswers}. Focus on topics: ${keyWords[0]}. {"choices": [array_of_words] "translations": [array_of_translations] }`;
  }

  /**
   * Creates a query for the API to generate a "write the sentence in the specified language" exercise, using the given parameters
   * @param language the language of the generated exercise
   * @param difficulty the exercise's difficulty level
   * @param keyWords a string array of keywords that are sent to the API to narrow the generated results
   */
  generateTranslateTheSentence(language: Language, difficulty: Difficulty, keyWords: string[]): string {
    return `generate a "translate the sentence" exercise, difficulty: ${Difficulty[difficulty]}. Focus on topics: ${keyWords[0]}. {"question": "english_sentence", "answer": "${language}_translation"}`;
  }

  /**
   * Creates a query for the API to generate a "complete the conversation" exercise, using the given parameters
   * @param language the language of the generated exercise
   * @param difficulty the exercise's difficulty level
   * @param keyWords a string array of keywords that are sent to the API to narrow the generated results
   */
  generateCompleteTheConversation(language: Language, difficulty: Difficulty, keyWords: string[]): string {
    return `generate a "complete the conversation" exercise, difficulty: ${Difficulty[difficulty]}, language: ${language}. First choice is grammatically correct and makes sense, second choice doesn't. Focus on topics: ${keyWords[0]}. { "question": "question/statement", "choices": ["reply1","reply2"] "translation": "english_translation_of_question_&_correct_reply" }`;
  }

  /**
   * Creates a query for the API to generate a "match the words to their translations" exercise, using the given parameters
   * @param language the language of the generated exercise
   * @param difficulty the exercise's difficulty level
   * @param keyWords a string array of keywords that are sent to the API to narrow the generated results
   */
  generateMatchTheWords(language: Language, difficulty: Difficulty, keyWords: string[]): string {
    // Exercise-specific parameters
    let numOfPairs: number;

    // Parameters for very easy and easy difficulties
    if (difficulty == 0) {
      numOfPairs = 4;
    }
    // Parameters for medium and hard difficulties
    else if (difficulty == 1) {
      numOfPairs = 5;
    }
    // Parameters for very hard and expert difficulties
    else {
      numOfPairs = 6;
    }

    return `Generate an array of word pairs in ${language}, ${Difficulty[difficulty]} difficulty. ${numOfPairs} pairs. Focus on topics: ${keyWords[0]}. Follow this json structure: "correctPairs": { ["word","translation"] }`;
  }

  /**
   * Creates a query for the API to generate a "reorder the words into a proper sentence" exercise, using the given parameters
   * @param language the language of the generated exercise
   * @param difficulty the exercise's difficulty level
   * @param keyWords a string array of keywords that are sent to the API to narrow the generated results
   */
  generateReorderSentence(language: Language, difficulty: Difficulty, keyWords: string[]): string {
    let sentenceLength: string;

    // Parameters for very easy and easy difficulties
    if (difficulty == 0) {
      sentenceLength = "short";
    }
    // Parameters for medium and hard difficulties
    else if (difficulty == 1) {
      sentenceLength = "medium";
    }
    // Parameters for very hard and expert difficulties
    else {
      sentenceLength = "long";
    }

    return `generate a sentence, in ${language}, ${Difficulty[difficulty]} difficulty, ${sentenceLength} length. Focus on topics: ${keyWords[0]} { "answer": "", "translation": "" }`;
  }

  /**
   * Creates a query for the API to generate a "match the words to their categories" exercise, using the given parameters
   * @param language the language of the generated exercise
   * @param difficulty the exercise's difficulty level
   * @param keyWords a string array of keywords that are sent to the API to narrow the generated results
   */
  generateMatchTheCategory(language: Language, difficulty: Difficulty, keyWords: string[]): string {
    return `Generate 2 distinct categories and 4 words for each, in ${language}, ${Difficulty[difficulty]} difficulty. Focus on topics: ${keyWords[0]} Ensure the response is strictly in the following JSON format: { "cat_a": "", "cat_b": "", "words_a": [], "words_b": [] }. Do not include any additional keys.`;
  }

  /**
   * Sends a request to the backend to call the API using the given prompt string
   * @param promptString the prompt string of the exercise to be generated
   * @returns an observable of the API's response JSON
   */
  getExerciseFromApi(promptString: string): Observable<object> {
    const {href} = new URL('generateLesson', this.apiUrl);

    // API CONNECTION
    // return this.http.post(href,{userPrompt: promptString});

    // MOCK DATA
    return of(cloneDeep(this.mockExercise_MatchTheWords));
  }

}
