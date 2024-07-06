import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { catchError, forkJoin, map, Observable, of } from 'rxjs';
import { Language } from '../../../models/enums/language.enum';
import { Difficulty } from '../../../models/enums/difficulty.enum';
import { ExerciseType } from '../../../models/enums/exercise-type.enum';
import { Exercise } from '../../../models/exercise.interface';
import _ from 'lodash';

@Injectable({
  providedIn: 'root'
})
export class LearnService {
  private readonly apiUrl = environment.apiUrl;
  private readonly http = inject(HttpClient);


  mockExercise_Type1: Exercise = {
    type: ExerciseType.FillInTheBlank,
    question: "The sun rises in the ",
    choices: ["East","West","North","South"],
    answer: "East"
  }

  mockExercise_Type2: Exercise = {
    type: ExerciseType.TranslateWord,
    question: "תפוח",
    choices: ["Hello","Apple","Tree"],
    answer: "Apple"
  }

  mockExercise_Type3: Exercise = {
    type: ExerciseType.TranslateTheSentence,
    language: Language.English,
    question: "קוראים לי דני",
    answer: "My name is Danny"
  }

  mockExercise_Type4: Exercise = {
    type: ExerciseType.CompleteTheConversation,
    language: Language.Hebrew,
    question: "בהצלחה במבחן!",
    choices: ["תודה, גם לך!","נעים להכיר!"],
    answer: "תודה, גם לך!",
    translation: "Person A: Good luck on the test! Person B: Thanks, You too!"
  }

  mockExercise_Type5: Exercise = {
    type: ExerciseType.MatchTheWords,
    correctWordPairs: [
      ["חתול", "Cat"],
      ["מים", "Water"],
      ["תפוז", "Orange"],
      ["ספר", "Book"],
      ["שולחן", "Table"]
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
    let keyWords = this.insertKeyWords(difficulty); // Insert special keywords for the api based on the difficulty

    // All functions that can be called to generate an exercise
    const exerciseGenerators = [
      this.generateFillInTheBlank.bind(this),
      this.generateTranslateWord.bind(this),
      this.generateWriteTheSentence.bind(this),
      this.generateCompleteTheConversation.bind(this),
      this.generateMatchTheWords.bind(this)
    ];

    const exerciseObservables: Observable<Exercise>[] = []; // Stores the observables returned by the exercise generators

    for (let i = 0; i < amount; i++) {
      // Choose a random exercise index
      let randomIndex: number = Math.floor(Math.random() * exerciseGenerators.length);
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
   * @param keyWords a string array of keywords that are sent to the API to narrow the generated results
   * @private
   */
  private insertKeyWords(difficulty: Difficulty) {
    let keyWords: string[] = [];
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

    return of(this.mockExercise_Type1);
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

    return of(this.mockExercise_Type2);
  }

  /**
   * Sends a query to the API to generate a "write the sentence in the specified language" exercise, using the given parameters
   * @param language the language of the generated exercise
   * @param difficulty the exercise's difficulty level
   * @param keyWords a string array of keywords that are sent to the API to narrow the generated results
   */
  generateWriteTheSentence(language: Language, difficulty: Difficulty, keyWords: string[]): Observable<Exercise> {
    return of(this.mockExercise_Type3);
  }

  generateCompleteTheConversation(language: Language, difficulty: Difficulty, keyWords: string[]): Observable<Exercise> {
    return of(this.mockExercise_Type4);
  }
  /**
   * Sends a query to the API to generate a "match the words to their translations" exercise, using the given parameters
   * @param language the language of the generated exercise
   * @param difficulty the exercise's difficulty level
   * @param keyWords a string array of keywords that are sent to the API to narrow the generated results
   */
  generateMatchTheWords(language: Language, difficulty: Difficulty, keyWords: string[]): Observable<Exercise> {
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
    this.mockExercise_Type5.randomizedWordPairs = this.shuffleWordPairs(this.mockExercise_Type5.correctWordPairs?? []);

    return of(this.mockExercise_Type5);
  }

  /**
   * Shuffles the locations of the left words and the locations of the right words in the array
   * @param wordPairs an array of string pairs. first element in pair - left word.
   *                  Second element in pair - right word
   */
  shuffleWordPairs(wordPairs: [string, string][]): [string, string][] {
    const leftWords = wordPairs.map(pair => pair[0]);
    const rightWords = wordPairs.map(pair => pair[1]);

    // Shuffle each array independently
    const shuffledLeftWords = _.shuffle(leftWords);
    const shuffledRightWords = _.shuffle(rightWords);

    // Re-pair the shuffled words
    return shuffledLeftWords.map((leftWord, index) => [leftWord, shuffledRightWords[index]])
  }

}
