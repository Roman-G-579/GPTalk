import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { catchError, forkJoin, map, Observable, of } from 'rxjs';
import { Language } from '../../../models/enums/language.enum';
import { Difficulty } from '../../../models/enums/difficulty.enum';
import { ExerciseType } from '../../../models/enums/exercise-type.enum';
import { Exercise } from '../../../models/exercise.interface';
import { LearnMiscUtils as util } from '../utils/learn-misc-utils';

@Injectable({
  providedIn: 'root'
})
export class LearnService {
  private readonly apiUrl = environment.apiUrl;
  private readonly http = inject(HttpClient);

  mockExercise_FillInTheBlank: Exercise = {
    type: ExerciseType.FillInTheBlank,
    instructions: '',
    question: "The sun rises in the ",
    choices: ["East","West","North","South"],
    answer: "East"
  }

  mockExercise_TranslateWord: Exercise = {
    type: ExerciseType.TranslateWord,
    instructions: '',
    question: "תפוח",
    choices: ["Hello","Apple","Tree"],
    answer: "Apple"
  }

  mockExercise_TranslateSentence: Exercise = {
    type: ExerciseType.TranslateTheSentence,
    instructions: '',
    language: Language.English,
    question: "קוראים לי דני",
    answer: "My name is Danny"
  }

  mockExercise_CompleteTheConversation: Exercise = {
    type: ExerciseType.CompleteTheConversation,
    language: Language.Hebrew,
    instructions: '',
    question: "בהצלחה במבחן!",
    choices: ["תודה, גם לך!","נעים להכיר!"],
    answer: "תודה, גם לך!",
    translation: "Person A: Good luck on the test! Person B: Thanks, You too!"
  }

  mockExercise_MatchTheWords: Exercise = {
    type: ExerciseType.MatchTheWords,
    instructions: '',
    correctPairs: [
      ["חתול", "Cat"],
      ["מים", "Water"],
      ["תפוז", "Orange"],
      ["ספר", "Book"],
      ["שולחן", "Table"]
    ],
  }

  mockExercise_ReorderSentence: Exercise = {
    type: ExerciseType.ReorderSentence,
    language: Language.Hebrew,
    instructions: '',
    choices: ['יוסי','רוכב','על','האופניים'],
    answer: 'יוסי רוכב על האופניים',
    translation: 'Yossi is riding the bicycle'
  }

  mockExercise_MatchTheCategory: Exercise = {
    type: ExerciseType.MatchTheCategory,
    language: Language.Hebrew,
    instructions: '',
    correctPairs: [
      ["כדורסל", "ספורט"],
      ["טניס", "ספורט"],
      ["עוגה", "אוכל"],
      ["עגבניה", "אוכל"],
      ["כדורגל", "ספורט"],
      ["תפוח","אוכל"]
    ],
  }
  /**
   * Calls a random exercise generator function
   *
   * @param language the language of the generated exercise
   * @param difficulty difficulty the difficulty level
   * @param amount the amount of exercises to be generated
   */
  generateLesson(language: Language, difficulty: Difficulty, amount: number): Observable<Exercise[]> {
    const keyWords = this.insertKeyWords(difficulty); // Insert special keywords for the api based on the difficulty

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

    const exerciseObservables: Observable<Exercise>[] = []; // Stores the observables returned by the exercise generators

    for (let i = 0; i < amount; i++) {
      // Choose a random exercise index
      const randomIndex: number = Math.floor(Math.random() * exerciseGenerators.length);
      //let randomIndex = 0;
      const generatorFunc = exerciseGenerators[randomIndex]; // The chosen function

      // Generate an exercise based on the randomized exercise index
      // And place its result in the observables array
      exerciseObservables.push(generatorFunc(language,difficulty,keyWords));
    }

    return forkJoin(exerciseObservables).pipe(
      map(exercises => {
        return exercises as Exercise[];
      }),
      catchError(err => {
        console.error(err);
        return [];
      })
    );
  }

  /**
   * Inserts strings into the keyWords array based on the given difficulty
   * @param difficulty the difficulty level
   * @private
   */
  private insertKeyWords(difficulty: Difficulty) {
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
   * Sends a query to the API to generate a "fill in the blanks" exercise, using the given parameters
   * @param language the language of the generated exercise
   * @param difficulty the exercise's difficulty level
   * @param keyWords a string array of keywords that are sent to the API to narrow the generated results
   */
  generateFillInTheBlank(language: Language, difficulty: Difficulty, keyWords: string[]): Observable<Exercise> {
    // Exercise-specific parameters
    let numOfAnswers: number;
    this.mockExercise_FillInTheBlank.heading = 'Fill in the blank';
    this.mockExercise_FillInTheBlank.instructions = 'Click on an answer or type it and hit the <i>enter</i> key to submit';

    // Parameters for very easy and easy difficulties
    if (difficulty >= 0 && difficulty < 2) {
      numOfAnswers = 3;
    }
    // Parameters for medium and hard difficulties
    else if (difficulty >= 3 && difficulty < 4) {
      numOfAnswers = 4;
    }
    // Parameters for very hard and expert difficulties
    else {
      numOfAnswers = 5;
    }

    return of(this.mockExercise_FillInTheBlank);
  }

  /**
   * Sends a query to the API to generate a "translate words" exercise, using the given parameters
   * @param language the language of the generated exercise
   * @param difficulty the exercise's difficulty level
   * @param keyWords a string array of keywords that are sent to the API to narrow the generated results
   */
  generateTranslateWord(language: Language, difficulty: Difficulty, keyWords: string[]): Observable<Exercise> {
    // Exercise-specific parameters
    let numOfAnswers: number;
    this.mockExercise_TranslateWord.heading = 'Choose the correct translation';
    this.mockExercise_TranslateWord.instructions = 'Click on the correct translation of the given word';

    // Parameters for very easy and easy difficulties
    if (difficulty >= 0 && difficulty < 2) {
      numOfAnswers = 3;
    }
    // Parameters for medium and hard difficulties
    else if (difficulty >= 3 && difficulty < 4) {
      numOfAnswers = 4;
    }
    // Parameters for very hard and expert difficulties
    else {
      numOfAnswers = 5;
    }

    return of(this.mockExercise_TranslateWord);
  }

  /**
   * Sends a query to the API to generate a "write the sentence in the specified language" exercise, using the given parameters
   * @param language the language of the generated exercise
   * @param difficulty the exercise's difficulty level
   * @param keyWords a string array of keywords that are sent to the API to narrow the generated results
   */
  generateTranslateTheSentence(language: Language, difficulty: Difficulty, keyWords: string[]): Observable<Exercise> {
    this.mockExercise_TranslateSentence.heading = 'Translate the sentence';
    this.mockExercise_TranslateSentence.instructions =`Write the given sentence in ${language}`;

    return of(this.mockExercise_TranslateSentence);
  }

  /**
   * Sends a query to the API to generate a "complete the conversation" exercise, using the given parameters
   * @param language the language of the generated exercise
   * @param difficulty the exercise's difficulty level
   * @param keyWords a string array of keywords that are sent to the API to narrow the generated results
   */
  generateCompleteTheConversation(language: Language, difficulty: Difficulty, keyWords: string[]): Observable<Exercise> {
    this.mockExercise_CompleteTheConversation.heading = 'Complete the conversation';
    this.mockExercise_CompleteTheConversation.instructions = `Click on an answer or type it and hit the <i>enter</i> key to submit`;

    return of(this.mockExercise_CompleteTheConversation);
  }
  /**
   * Sends a query to the API to generate a "match the words to their translations" exercise, using the given parameters
   * @param language the language of the generated exercise
   * @param difficulty the exercise's difficulty level
   * @param keyWords a string array of keywords that are sent to the API to narrow the generated results
   */
  generateMatchTheWords(language: Language, difficulty: Difficulty, keyWords: string[]): Observable<Exercise> {
    this.mockExercise_MatchTheWords.heading = 'Match the words';
    this.mockExercise_MatchTheWords.instructions = `Match the words in ${language} to their English translations`;

    // Exercise-specific parameters
    let numOfPairs: number;

    // Parameters for very easy and easy difficulties
    if (difficulty >= 0 && difficulty < 2) {
      numOfPairs = 4;
    }
    // Parameters for medium and hard difficulties
    else if (difficulty >= 3 && difficulty < 4) {
      numOfPairs = 5;
    }
    // Parameters for very hard and expert difficulties
    else {
      numOfPairs = 6;
    }

    // Get the exercise object from the api

    // Randomize the word pairs
    this.mockExercise_MatchTheWords.randomizedPairs = util.shuffleWordPairs(this.mockExercise_MatchTheWords.correctPairs?? []);

    return of(this.mockExercise_MatchTheWords);
  }

  /**
   * Sends a query to the API to generate a "reorder the words into a proper sentence" exercise, using the given parameters
   * @param language the language of the generated exercise
   * @param difficulty the exercise's difficulty level
   * @param keyWords a string array of keywords that are sent to the API to narrow the generated results
   */
  generateReorderSentence(language: Language, difficulty: Difficulty, keyWords: string[]): Observable<Exercise> {
    let sentenceLength: number;
    this.mockExercise_ReorderSentence.heading = 'Arrange the words to form a correct sentence';
    this.mockExercise_ReorderSentence.instructions = `Click the words sequentially to place them onto the board. Click submit when finished.`;

    // Parameters for very easy and easy difficulties
    if (difficulty >= 0 && difficulty < 2) {
      sentenceLength = 4;
    }
    // Parameters for medium and hard difficulties
    else if (difficulty >= 3 && difficulty < 4) {
      sentenceLength = 5;
    }
    // Parameters for very hard and expert difficulties
    else {
      sentenceLength = 6;
    }

    return of(this.mockExercise_ReorderSentence);
  }

  generateMatchTheCategory(language: Language, difficulty: Difficulty, keyWords: string[]): Observable<Exercise> {
    this.mockExercise_MatchTheCategory.heading = 'Match the words to their correct category';
    this.mockExercise_MatchTheCategory.instructions = 'Drag and drop the words to their category container. Click submit when finished.'

    return of(this.mockExercise_MatchTheCategory);
  }




}
