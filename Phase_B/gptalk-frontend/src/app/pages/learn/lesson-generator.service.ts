/* eslint-disable @typescript-eslint/no-unused-vars */
import {inject, Injectable} from '@angular/core';
import {environment} from '../../../environments/environment';
import {HttpClient} from '@angular/common/http';
import {Language} from '../../core/enums/language.enum';
import {Difficulty} from '../../core/enums/difficulty.enum';
import {Exercise} from '../../core/interfaces/exercise.interface';
import {LessonGeneratorUtils as genUtil} from './utils/lesson-generator.utils';
import {forkJoin, map, Observable, of} from 'rxjs';
import {ExerciseType} from '../../core/enums/exercise-type.enum';
import {cloneDeep} from 'lodash';
import {CONVERSATION_STARTERS, MISTAKE_TYPES} from "../../core/utils/completeTheConversationConsts";

@Injectable({
  providedIn: 'root'
})
export class LessonGeneratorService {
  private readonly apiUrl = environment.apiUrl;
  private readonly http = inject(HttpClient);

  mockExercise_FillInTheBlank: Exercise = {
    type: ExerciseType.FillInTheBlank,
    answer: "הטיסה ממריאה מחר בבוקר",
    choices: ["חתול","קפה","לרוץ"],
    translation: "The flight takes off tomorrow"
  }

  mockExercise_FillInTheBlank_ENG: Exercise = {
    type: ExerciseType.FillInTheBlank,
    answer: "Planes are faster than cars",
    choices: ["cat","table","cloud"],
    translation: "מטוסים מהירים יותר ממכוניות"
  }

  mockExercise_TranslateWord: Exercise = {
    type: ExerciseType.TranslateWord,
    choices: ["מכונית", "ספר", "שולחן", "תפוח"],
    translations: ["car", "book", "table", "apple"]
  }

  mockExercise_TranslateWord_ENG: Exercise = {
    type: ExerciseType.TranslateWord,
    choices: ["מכונית", "ספר", "שולחן", "תפוח"],
    translations: ["car", "book", "table", "apple"]
  }

  mockExercise_TranslateSentence: Exercise = {
    type: ExerciseType.TranslateTheSentence,
    question: "I love climbing mountains",
    answer: "אני אוהב לטפס על הרים"
  }

  mockExercise_TranslateSentence_2: Exercise = {
    type: ExerciseType.TranslateTheSentence,
    question: "the museum is located near the ancient ruins.",
    answer: "המוזיאון נמצא ליד חורבות עתיקות"
  }

  mockExercise_TranslateSentence_ENG: Exercise = {
    type: ExerciseType.TranslateTheSentence,
    question: "מטוסים מהירים יותר ממכוניות",
    answer: "Planes are faster than cars."
  }

  mockExercise_CompleteTheConversation: Exercise = {
    type: ExerciseType.CompleteTheConversation,
    question: "מתי אתה מתכנן לסיים את הפרויקט?",
    choices: ["אני מתכנן לסיים את הפרויקט בסוף השבוע.", "אני מתכננים לסיים את הפרויקט בסוף השבוע."],
    translation: "When do you plan to finish the project? / I plan to finish the project by the end of the week."
  }

  mockExercise_CompleteTheConversation_ENG: Exercise = {
    type: ExerciseType.CompleteTheConversation,
    question: "How do I get to the train station?",
    choices: ["The quickest way to get there is either by bus or by taxi", "The bus or the taxi is faster to get it."],
    translation: "כיצד אני מגיע לתחנת הרכבת? / הדרך המהירה ביותר להגיע לשם היא בעזרת אוטובוס או מונית."
  }

  // mockExercise_MatchTheWords: Exercise = {
  //   type: ExerciseType.MatchTheWords,
  //   "correctPairs": [
  //     ["מכונית", "car"],
  //     ["בית", "house"],
  //     ["חתול", "cat"],
  //   ]
  // }

  mockExercise_MatchTheWords: Exercise = {
    type: ExerciseType.MatchTheWords,
    "correctPairs": [
      ["מכונית", "car"],
      ["בית", "house"],
      ["חתול", "cat"],
      ["עץ", "tree"],
      ["ספר", "book"]
    ]
  }

  mockExercise_ReorderSentence: Exercise = {
    type: ExerciseType.ReorderSentence,
    "answer": "הילד הלך לבית הספר עם חבריו.",
    "translation": "The boy went to school with his friends."
  }

  mockExercise_ReorderSentence_ENG: Exercise = {
    type: ExerciseType.ReorderSentence,
    "answer": "The fish are swimming in our pond",
    "translation": "הדגים שוחים בנחל שלנו"
  }
  //
  mockExercise_MatchTheCategory: Exercise = {
    type: ExerciseType.MatchTheCategory,
    "cat_a": "חיות",
    "cat_b": "פירות",
    "words_a": ["כלב", "חתול", "זאב" ,"סוס"],
    "words_b": ["תפוח", "בננה","ענבים" ,"תפוז"]
  }

  mockExercise_MatchTheCategory_ENG: Exercise = {
    type: ExerciseType.MatchTheCategory,
    "cat_a": "Air vehicles",
    "cat_b": "Land vehicles",
    "words_a": ["helicopter", "airplane", "glider" ,"hot air balloon"],
    "words_b": ["car", "bike","truck" ,"snowmobile"]
  }

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
      const randomIndex: number = Math.floor(Math.random() * exerciseGenerators.length);
      // const randomIndex: number = 2;

      // The Chosen function
      const generatorFunc = exerciseGenerators[randomIndex];

      // Generate an exercise prompt based on the randomized exercise index
      const exercisePrompt = generatorFunc(language,difficulty,keyWords);

      // Get JSON object from API and convert it to an Exercise object
      const exerciseObservable = this.getExerciseFromApi(exercisePrompt).pipe(
        map(response => {
          //console.log(response)
          const exerciseType = <ExerciseType>(randomIndex); // Sets the generated exercise's type
          return genUtil.convertToExerciseObject(response as Exercise, exerciseType);
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

    // If the lesson's language is English, the sentence to complete will be in English.
    // Otherwise, the sentence is in the lesson's language
    const translationLanguage = language == Language.English ? Language.Hebrew : Language.English;

    // Parameters for novice difficulty
    if (difficulty == Difficulty.Novice) { numOfAnswers = 3; }
    // Parameters for advanced difficulty
    else if (difficulty == Difficulty.Advanced) { numOfAnswers = 4; }
    // Parameters for master difficulty
    else { numOfAnswers = 5; }

    return `generate an object in ${language}, ${Difficulty[difficulty]} difficulty. 'answer' is the sentence, 'translation' is its ${translationLanguage} translation, 'choices' is ${numOfAnswers} random words, not found in "answer". Focus on topics: ${keyWords[0]}. {"answer": "", "choices:" [], "translation": ""}`;
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

    // If the lesson's language is English, the word is to be translated from Hebrew to English.
    // Otherwise, the word is to be translated from English to the lesson's language
    const wordLanguage = language == Language.English ? Language.Hebrew : Language.English;
    const translationLanguage = wordLanguage == Language.Hebrew ? Language.English : language;

    // Parameters for novice difficulty
    if (difficulty == Difficulty.Novice) { numOfAnswers = 3; }
    // Parameters for advanced difficulty
    else if (difficulty == Difficulty.Advanced) { numOfAnswers = 4; }
    // Parameters for master difficulty
    else { numOfAnswers = 5; }

    return `generate word array, difficulty: ${Difficulty[difficulty]}, language: ${wordLanguage}. number of words: ${numOfAnswers}. Focus on topics: ${keyWords[0]}. {"choices": [array_of_words] "translations": [array_of_${translationLanguage}_translations] }`;
  }

  /**
   * Creates a query for the API to generate a "write the sentence in the specified language" exercise, using the given parameters
   * @param language the language of the generated exercise
   * @param difficulty the exercise's difficulty level
   * @param keyWords a string array of keywords that are sent to the API to narrow the generated results
   */
  generateTranslateTheSentence(language: Language, difficulty: Difficulty, keyWords: string[]): string {
    // If the lesson's language is English, the sentence is to be translated from Hebrew to English.
    // Otherwise, the sentence is to be translated from English to the lesson's language
    const sentenceLanguage = language == Language.English ? Language.Hebrew : Language.English;
    const translationLanguage = sentenceLanguage == Language.Hebrew ? Language.English : language;

    return `generate a "translate the sentence" exercise, difficulty: ${Difficulty[difficulty]}. Focus on topics: ${keyWords[0]}. {"question": "${sentenceLanguage} sentence", "answer": "${translationLanguage}_translation"}`;
  }

  /**
   * Creates a query for the API to generate a "complete the conversation" exercise, using the given parameters
   * @param language the language of the generated exercise
   * @param difficulty the exercise's difficulty level
   * @param keyWords a string array of keywords that are sent to the API to narrow the generated results
   */
  generateCompleteTheConversation(language: Language, difficulty: Difficulty, keyWords: string[]): string {
    let replyLengthLimit: number; // Limits the length of the reply options based on difficulty

    // If the lesson's language is English, the conversation is in English.
    // Otherwise, the conversation is in the lesson's language
    const conversationLanguage = language;
    const translationLanguage = conversationLanguage == Language.English ? Language.Hebrew : Language.English;

    // Sets random conversation starter type and random mistake type for one of the replies
    let randomIndex: number = Math.floor(Math.random() * CONVERSATION_STARTERS.length);
    const conversationStarter = CONVERSATION_STARTERS[randomIndex];

    randomIndex = Math.floor(Math.random() * MISTAKE_TYPES.length);
    const mistakeType = MISTAKE_TYPES[randomIndex];

    // Parameters for novice difficulty
    if (difficulty == Difficulty.Novice) { replyLengthLimit = 4; }
    // Parameters for advanced difficulty
    else if (difficulty == Difficulty.Advanced) { replyLengthLimit = 8; }
    // Parameters for master difficulty
    else { replyLengthLimit = 10; }

    return `generate object of strings in ${conversationLanguage}. All sentences of ${Difficulty[difficulty]} difficulty. reply1 is a grammatically and logically correct reply, reply2 contains ${mistakeType} error (replies have ${replyLengthLimit} words or less). Focus on topics: ${keyWords[0]}. { "prompt": ${conversationStarter}, "choices": [reply1,reply2] "translation": prompt_&_correct_reply_in_${translationLanguage} }`;
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

    // If the lesson's language is English, the second word in each pair is in Hebrew
    // Otherwise, the second word in the pair is in English
    const secondWordLanguage = language == Language.English ? Language.Hebrew : Language.English;

    // Parameters for novice difficulty
    if (difficulty == Difficulty.Novice) { numOfPairs = 4; }
    // Parameters for advanced difficulty
    else if (difficulty == Difficulty.Advanced) { numOfPairs = 5; }
    // Parameters for master difficulty
    else { numOfPairs = 6; }

    return `Generate an array of word pairs in ${language}, ${Difficulty[difficulty]} difficulty. ${numOfPairs} pairs. Focus on topics: ${keyWords[0]}. Follow this json structure: "correctPairs": { ["word","${secondWordLanguage}_translation"] }`;
  }

  /**
   * Creates a query for the API to generate a "reorder the words into a proper sentence" exercise, using the given parameters
   * @param language the language of the generated exercise
   * @param difficulty the exercise's difficulty level
   * @param keyWords a string array of keywords that are sent to the API to narrow the generated results
   */
  generateReorderSentence(language: Language, difficulty: Difficulty, keyWords: string[]): string {
    let sentenceLength: number;

    // If the lesson's language is English, the translation is to Hebrew.
    // Otherwise, the translation is to  English
    const translationLanguage = language == Language.English ? Language.Hebrew : Language.English;

    // Parameters for novice difficulty
    if (difficulty == Difficulty.Novice) { sentenceLength = 4; }
    // Parameters for advanced difficulty
    else if (difficulty == Difficulty.Advanced) { sentenceLength = 5; }
    // Parameters for master difficulty
    else { sentenceLength = 6; }

    return `generate a ${sentenceLength} words long sentence (no repeating words), in ${language}, ${Difficulty[difficulty]} difficulty. Focus on topics: ${keyWords[0]} { "answer": "", "translation": "${translationLanguage}_translation" }`;
  }

  /**
   * Creates a query for the API to generate a "match the words to their categories" exercise, using the given parameters
   * @param language the language of the generated exercise
   * @param difficulty the exercise's difficulty level
   * @param keyWords a string array of keywords that are sent to the API to narrow the generated results
   */
  generateMatchTheCategory(language: Language, difficulty: Difficulty, keyWords: string[]): string {
    // If the lesson's language is English, the translation is to Hebrew.
    // Otherwise, the translation is to  English
    // const translationLanguage = language == Language.English ? Language.Hebrew : Language.English;

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
    return this.http.post(href,{userPrompt: promptString});

    // MOCK DATA
    // return of(cloneDeep(this.mockExercise_TranslateSentence));
  }

}
