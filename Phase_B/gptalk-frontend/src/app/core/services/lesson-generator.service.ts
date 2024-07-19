import {inject, Injectable, signal} from '@angular/core';
import {environment} from '../../../environments/environment';
import {HttpClient} from '@angular/common/http';
import {Language} from '../../../models/enums/language.enum';
import {Difficulty} from '../../../models/enums/difficulty.enum';
import {ExerciseType} from '../../../models/enums/exercise-type.enum';
import {Exercise} from '../../../models/exercise.interface';
import {LearnGeneratorUtils as genUtil} from '../utils/learn-generator-utils';

@Injectable({
  providedIn: 'root'
})
export class LessonGeneratorService {
  // private readonly apiUrl = environment.apiUrl;
  // private readonly http = inject(HttpClient);

  promptString = signal<string>('');

  mockLesson = {
    0: {
      "question": " דנה רוצה לשתות",
      "choices": ["תפוח", "מכונית", "מים", "חנות"],
      "answer": "מים",
      "translation": "Dana wants to drink water"
    },
    2: {
      "question": "קוראים לי דני",
      "answer": "My name is Danny"
    },
    3: {
      "question": "בהצלחה במבחן!",
      "choices": ["תודה, גם לך!", "נעים להכיר!"],
      "answer": "תודה, גם לך!",
      "translation": "Person A: Good luck on the test! Person B: Thanks, You too!"
    },
    1: {
      "question": "תפוח",
      "choices": ["Hello", "Apple", "Tree"],
      "answer": "Apple"
    },
    4: {
      "correctPairs": [
        ["חתול", "Cat"],
        ["מים", "Water"],
        ["תפוז", "Orange"],
        ["ספר", "Book"],
        ["שולחן", "Table"]
      ]
    }
  }

  // mockExercise_FillInTheBlank: Exercise = {
  //   type: ExerciseType.FillInTheBlank,
  //   instructions: '',
  //   question: "The sun rises in the ",
  //   choices: ["East","West","North","South"],
  //   answer: "East"
  // }
  //
  // mockExercise_TranslateWord: Exercise = {
  //   type: ExerciseType.TranslateWord,
  //   instructions: '',
  //   question: "תפוח",
  //   choices: ["Hello","Apple","Tree"],
  //   answer: "Apple"
  // }
  //
  // mockExercise_TranslateSentence: Exercise = {
  //   type: ExerciseType.TranslateTheSentence,
  //   instructions: '',
  //   language: Language.English,
  //   question: "קוראים לי דני",
  //   answer: "My name is Danny"
  // }
  //
  // mockExercise_CompleteTheConversation: Exercise = {
  //   type: ExerciseType.CompleteTheConversation,
  //   language: Language.Hebrew,
  //   instructions: '',
  //   question: "בהצלחה במבחן!",
  //   choices: ["תודה, גם לך!","נעים להכיר!"],
  //   answer: "תודה, גם לך!",
  //   translation: "Person A: Good luck on the test! Person B: Thanks, You too!"
  // }
  //
  // mockExercise_MatchTheWords: Exercise = {
  //   type: ExerciseType.MatchTheWords,
  //   instructions: '',
  //   correctPairs: [
  //     ["חתול", "Cat"],
  //     ["מים", "Water"],
  //     ["תפוז", "Orange"],
  //     ["ספר", "Book"],
  //     ["שולחן", "Table"]
  //   ],
  // }
  //
  // mockExercise_ReorderSentence: Exercise = {
  //   type: ExerciseType.ReorderSentence,
  //   language: Language.Hebrew,
  //   instructions: '',
  //   choices: ['יוסי','רוכב','על','האופניים'],
  //   answer: 'יוסי רוכב על האופניים',
  //   translation: 'Yossi is riding the bicycle'
  // }
  //
  // mockExercise_MatchTheCategory: Exercise = {
  //   type: ExerciseType.MatchTheCategory,
  //   language: Language.Hebrew,
  //   instructions: '',
  //   correctPairs: [
  //     ["כדורסל", "ספורט"],
  //     ["טניס", "ספורט"],
  //     ["עוגה", "אוכל"],
  //     ["עגבניה", "אוכל"],
  //     ["כדורגל", "ספורט"],
  //     ["תפוח","אוכל"]
  //   ],
  // }

  /**
   * Calls a random exercise generator function
   *
   * @param language the language of the generated exercise
   * @param difficulty difficulty the difficulty level
   * @param amount the amount of exercises to be generated
   */
  generateLesson(language: Language, difficulty: Difficulty, amount: number): Exercise[] {
    const keyWords = genUtil.insertKeyWords(difficulty); // Insert special keywords for the api based on the difficulty
    const promptText = `Generate the following ${amount} exercises in ${language}.
    Follow the example for each requested type, use the exercise type as a JSON key:\n`;
    genUtil.updateStringSignal(this.promptString,promptText);

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

    for (let i = 0; i < amount; i++) {
      // Choose a random exercise index
      const randomIndex: number = Math.floor(Math.random() * exerciseGenerators.length);

      const generatorFunc = exerciseGenerators[randomIndex]; // The chosen function

      // Generate an exercise prompt based on the randomized exercise index
      generatorFunc(language,difficulty,keyWords);
    }


    //TODO: fix api connection

    // const {href} = new URL('generateLesson', this.apiUrl)
    // let generatedResult =  this.http.post(href,this.promptString()).pipe(
    //   tap({
    //     next: (data) => {
    //       this.exercises.set(genUtil.convertToExerciseArray(this.mockLesson));
    //     },
    //     error: (err: unknown) => {
    //       console.log('Error fetching lesson data', err);
    //     }
    //   })
    // );

    return genUtil.convertToExerciseArray(this.mockLesson, language);
  }

  /**
   * Sends a query to the API to generate a "fill in the blanks" exercise, using the given parameters
   * @param language the language of the generated exercise
   * @param difficulty the exercise's difficulty level
   * @param keyWords a string array of keywords that are sent to the API to narrow the generated results
   */
  generateFillInTheBlank(language: Language, difficulty: Difficulty, keyWords: string[]) {
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

    const exercisePrompt = `Generate a "Fill in the blank" (type: 0) exercise:
        question: "The sun rises in the ",
        choices: ["East","West","North","South"],
        answer: "East"`
    genUtil.updateStringSignal(this.promptString,exercisePrompt);
  }

  /**
   * Sends a query to the API to generate a "translate words" exercise, using the given parameters
   * @param language the language of the generated exercise
   * @param difficulty the exercise's difficulty level
   * @param keyWords a string array of keywords that are sent to the API to narrow the generated results
   */
  generateTranslateWord(language: Language, difficulty: Difficulty, keyWords: string[]) {
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

    const exercisePrompt = `Generate a "Translate the word" (type: 1) exercise
        question: "תפוח",
        choices: ["Hello","Apple","Tree"],
        answer: "Apple"`
    genUtil.updateStringSignal(this.promptString,exercisePrompt);
  }

  /**
   * Sends a query to the API to generate a "write the sentence in the specified language" exercise, using the given parameters
   * @param language the language of the generated exercise
   * @param difficulty the exercise's difficulty level
   * @param keyWords a string array of keywords that are sent to the API to narrow the generated results
   */
  generateTranslateTheSentence(language: Language, difficulty: Difficulty, keyWords: string[]) {
    const exercisePrompt = `        Generate a "Translate the sentence" (type: 2) exercise
        question: "קוראים לי דני",
        answer: "My name is Danny"`
    genUtil.updateStringSignal(this.promptString,exercisePrompt);
  }

  /**
   * Sends a query to the API to generate a "complete the conversation" exercise, using the given parameters
   * @param language the language of the generated exercise
   * @param difficulty the exercise's difficulty level
   * @param keyWords a string array of keywords that are sent to the API to narrow the generated results
   */
  generateCompleteTheConversation(language: Language, difficulty: Difficulty, keyWords: string[]) {
    const exercisePrompt = `        Generate a "Complete conversation" (type: 3) exercise
        question: "בהצלחה במבחן!",
        choices: ["תודה, גם לך!","נעים להכיר!"],
        answer: "תודה, גם לך!",
        translation: "Person A: Good luck on the test! Person B: Thanks, You too!"`
    genUtil.updateStringSignal(this.promptString,exercisePrompt);
  }
  /**
   * Sends a query to the API to generate a "match the words to their translations" exercise, using the given parameters
   * @param language the language of the generated exercise
   * @param difficulty the exercise's difficulty level
   * @param keyWords a string array of keywords that are sent to the API to narrow the generated results
   */
  generateMatchTheWords(language: Language, difficulty: Difficulty, keyWords: string[]) {
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

    const exercisePrompt = `Generate a "Match the words" (type: 4) exercise
       correctPairs: [
      ["חתול", "Cat"],
      ["מים", "Water"],
      ["תפוז", "Orange"],
      ["ספר", "Book"],
      ["שולחן", "Table"]
      ],`
    genUtil.updateStringSignal(this.promptString,exercisePrompt);
  }

  /**
   * Sends a query to the API to generate a "reorder the words into a proper sentence" exercise, using the given parameters
   * @param language the language of the generated exercise
   * @param difficulty the exercise's difficulty level
   * @param keyWords a string array of keywords that are sent to the API to narrow the generated results
   */
  generateReorderSentence(language: Language, difficulty: Difficulty, keyWords: string[]) {
    let sentenceLength: number;

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

    const exercisePrompt = `Generate a "Reorder the sentence" (type: 5) exercise
        choices: ['יוסי','רוכב','על','האופניים'],
        answer: 'יוסי רוכב על האופניים',
        translation: 'Yossi is riding the bicycle'`
    genUtil.updateStringSignal(this.promptString,exercisePrompt);
  }

  generateMatchTheCategory(language: Language, difficulty: Difficulty, keyWords: string[]) {

    const exercisePrompt = `Generate a "Match the words" (type: 6) exercise
        correctPairs: [
        ["כדורסל", "ספורט"],
        ["טניס", "ספורט"],
        ["עוגה", "אוכל"],
        ["עגבניה", "אוכל"],
        ["כדורגל", "ספורט"],
        ["תפוח","אוכל"]
        ],`
    genUtil.updateStringSignal(this.promptString,exercisePrompt);
  }
}
