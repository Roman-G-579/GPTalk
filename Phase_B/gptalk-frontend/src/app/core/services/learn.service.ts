import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
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
    instructions: "Fill In The Blank",
    question: "The sun rises in the ",
    choices: ["East","West","North","South"],
    answer: "East"
  }

  mockExercise_Type2: Exercise = {
    type: ExerciseType.TranslateWord,
    instructions: "Choose the correct translation",
    question: "תפוח",
    choices: ["Hello","Apple","Tree"],
    answer: "Apple"
  }

  mockExercise_Type5: Exercise = {
    type: ExerciseType.MatchTheWords,
    instructions: "Match the words in english to their translations in hebrew",
    correctWordPairs: [
      ["חתול", "Cat"],
      ["מים", "Water"],
      ["תפוז", "Orange"],
      ["ספר", "Book"],
      ["שולחן", "Table"]
    ],
  }



  // Calls a random exercise generator function
  generateLesson(language: Language, difficulty: Difficulty): Observable<object> {
    const randomIndex: number = Math.floor(Math.random() * (Object.keys(ExerciseType).filter(key => isNaN(Number(key))).length));
    //const chosenExercise = this.exerciseTypesArr[randomIndex];
    const chosenExercise = ExerciseType.TranslateWord;
    let keyWords: string[] = [];

    // Parameters for very easy and easy difficulties
    if (difficulty >= 0 && difficulty < 2) {
      keyWords.push("simple", "beginners");
    }
    // Parameters for medium and hard difficulties
    else if (difficulty >= 3 && difficulty < 4) {
      keyWords.push("some familiarity with the language");
    }
    // Parameters for very hard and expert difficulties
    else {
      keyWords.push("high level learners", "challenge");
    }

    switch (chosenExercise.valueOf()) {
      case 0:
        return this.generateFillInTheBlank(language, difficulty, keyWords);

      case 1:
        return this.generateTranslateWord(language, difficulty, keyWords);

      case 2:
        return this.generateFillInTheBlank(language, difficulty, keyWords);

      case 3:
        return this.generateFillInTheBlank(language, difficulty, keyWords);

      case 4:
        return this.generateMatchTheWords(language, difficulty, keyWords);

      default:
        console.log("generateLesson switch error");
        return this.generateFillInTheBlank(language, difficulty, keyWords);
    }

  }

  // Sends a query to the api to generate a "fill in the blanks" exercise, using the given parameters
  generateFillInTheBlank(language: Language, difficulty: Difficulty, keyWords: string[]): Observable<object> {
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

  // Sends a query to the api to generate a "translate words" exercise, using the given parameters
  private generateTranslateWord(language: Language, difficulty: Difficulty, keyWords: string[]): Observable<object> {
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

  // Sends a query to the api to generate a "match the words to their translations" exercise, using the given parameters
  generateMatchTheWords(language: Language, difficulty: Difficulty, keyWords: string[]): Observable<object> {
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

  // Shuffles the locations of the left words and the locations of the right words in the array
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
