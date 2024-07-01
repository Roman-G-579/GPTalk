import {inject, Injectable} from '@angular/core';
import {environment} from "../../../environments/environment";
import {AuthService} from "./auth.service";
import {HttpClient} from "@angular/common/http";
import {Observable, of} from "rxjs";
import {Language} from "../../../models/enums/language";
import {Difficulty} from "../../../models/enums/difficulty";

@Injectable({
  providedIn: 'root'
})
export class LearnService {
  private readonly apiUrl = environment.apiUrl;
  private readonly http = inject(HttpClient);

  exerciseTypesArr: string[] = [
    "fillInTheBlank",
    "translateWord",
    "writeTheSentence",
    "completeTheConversation",
    "matchTheWords" ]

  mockExercise_Type1 = {
    question: "The sun rises in the _____",
    choices: ["east","west","north","south"],
    answer: "east"
  }

  // Calls a random exercise generator function
  generateExercise(language: Language, difficulty: Difficulty): Observable<object> {
    const randomIndex: number = Math.floor(Math.random() * this.exerciseTypesArr.length);
    //const chosenExercise = this.exerciseTypesArr[randomIndex];
    const chosenExercise = this.exerciseTypesArr[0];
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

    switch (chosenExercise) {
      case "fillInTheBlank":
        console.log("type1");
        return this.generateFillInTheBlank(language, difficulty, keyWords);

      case "translateWord":
        console.log("type2");
        return this.generateFillInTheBlank(language, difficulty, keyWords);

      case "writeTheSentence":
        console.log("type3");
        return this.generateFillInTheBlank(language, difficulty, keyWords);

      case "completeTheConversation":
        console.log("type4");
        return this.generateFillInTheBlank(language, difficulty, keyWords);

      case "matchTheWords":
        console.log("type5");
        return this.generateFillInTheBlank(language, difficulty, keyWords);

      default:
        console.log("error");
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

}
