import {inject, Injectable, signal} from '@angular/core';
import {environment} from '../../../environments/environment';
import {HttpClient} from '@angular/common/http';
import {Language} from '../../../models/enums/language.enum';
import {Difficulty} from '../../../models/enums/difficulty.enum';
import {Exercise} from '../../../models/exercise.interface';
import {LearnGeneratorUtils as genUtil} from '../utils/learn-generator-utils';
import {Observable, of} from 'rxjs';
import {ExerciseType} from "../../../models/enums/exercise-type.enum";

@Injectable({
  providedIn: 'root'
})
export class LessonGeneratorService {
  private readonly apiUrl = environment.apiUrl;
  private readonly http = inject(HttpClient);

  promptString = signal<string>('');
  exercises = signal<Exercise[]>([]);

  mockLesson = {
    0: {
      "sentenceBeforeBlank": " דנה רוצה לשתות",
      "sentenceAfterBlank": "",
      "choices": ["תפוח", "מכונית", "מים", "חנות"],
      "answer": "מים",
      "translation": "Dana wants to drink water"
    },
    2: {
      "question": "My name is Danny",
      "answer": "קוראים לי דני"
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
  generateLesson(language: Language, difficulty: Difficulty, amount: number): Observable<Exercise[]> {
    const keyWords = genUtil.insertKeyWords(difficulty); // Insert special keywords for the api based on the difficulty
    // const promptText = `Generate ${amount} varied ${Difficulty[difficulty]} exercises in ${language}.
    // Each one will be represented as a JSON object with a numerical key.
    // Generate each exercise to logically match what's written in "instructions" (exclude them from output).
    // Follow each example for the output, don't copy the examples.
    // Each exercise object must contain all keys that are present in its example
    // If exercise types repeat, generate different data for each:\n`;
    //
    //
    // genUtil.updatePromptString(this.promptString,promptText);

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

    const exerData: Exercise[] = [];
    return of(exerData);
    // const {href} = new URL('generateLesson', this.apiUrl)
    // return new Observable<Exercise[]>((obs) => {
    //
    //   // API CONNECTION
    //   this.http.post(href,{userPrompt: this.promptString()}).subscribe({
    //       next: (data) => {
    //         console.log("generated data: \n");
    //         console.log(data);
    //         this.exercises.set(genUtil.convertToExerciseArray(data, language));
    //         console.log("exercise array: \n");
    //         console.log(this.exercises());
    //         obs.next(this.exercises());
    //         obs.complete();
    //       },
    //       error: (err: unknown) => {
    //         console.log('Error fetching lesson data', err);
    //       }
    //     });
    //
    //   // PLACEHOLDER DATA
    //   // console.log(this.promptString());
    //   // this.exercises.set(genUtil.convertToExerciseArray(this.mockLesson, language));
    //   // obs.next(this.exercises());
    //   // obs.complete();
    //
    // });
  }

  /**
   * Sends a query to the API to generate a "fill in the blanks" exercise, using the given parameters
   * @param language the language of the generated exercise
   * @param difficulty the exercise's difficulty level
   * @param keyWords a string array of keywords that are sent to the API to narrow the generated results
   */
  generateFillInTheBlank(language: Language, difficulty: Difficulty, keyWords: string[]): Exercise {
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

    const exercisePrompt = `generate an object in ${language}, ${difficulty} difficulty. 'answer' is the sentence, 'translation' is its english translation, 'choices' is 3 random words. {"answer": "", "choices:" [], "translation": ""}`

    const result = this.getExerciseFromApi(exercisePrompt);

    return genUtil.convertToExerciseObject(result,ExerciseType.FillInTheBlank,language);
  }

  /**
   * Sends a query to the API to generate a "translate words" exercise, using the given parameters
   * @param language the language of the generated exercise
   * @param difficulty the exercise's difficulty level
   * @param keyWords a string array of keywords that are sent to the API to narrow the generated results
   */
  generateTranslateWord(language: Language, difficulty: Difficulty, keyWords: string[]): Exercise {
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

    const exercisePrompt = `generate a "translate the word" exercise, difficulty: ${difficulty}, language: ${language}. number of words: ${numOfAnswers} {"choices": [array_of_words] "translations": [array_of_translations] }`;

    const result = this.getExerciseFromApi(exercisePrompt);

    return genUtil.convertToExerciseObject(result,ExerciseType.TranslateWord,language);
  }

  /**
   * Sends a query to the API to generate a "write the sentence in the specified language" exercise, using the given parameters
   * @param language the language of the generated exercise
   * @param difficulty the exercise's difficulty level
   * @param keyWords a string array of keywords that are sent to the API to narrow the generated results
   */
  generateTranslateTheSentence(language: Language, difficulty: Difficulty, keyWords: string[]) {
    const exercisePrompt = `generate a "translate the sentence" exercise, difficulty: ${difficulty}. {"question": "english_sentence", "answer": "${language}_translation"}`;

    const result = this.getExerciseFromApi(exercisePrompt);

    return genUtil.convertToExerciseObject(result,ExerciseType.TranslateTheSentence,language);
  }

  /**
   * Sends a query to the API to generate a "complete the conversation" exercise, using the given parameters
   * @param language the language of the generated exercise
   * @param difficulty the exercise's difficulty level
   * @param keyWords a string array of keywords that are sent to the API to narrow the generated results
   */
  generateCompleteTheConversation(language: Language, difficulty: Difficulty, keyWords: string[]) {
    const exercisePrompt = `generate a "complete the conversation" exercise, difficulty: ${difficulty}, language: ${language}. First choice is grammatically correct and makes sense, second choice doesn't. { "question": "question/statement", "choices": ["reply1","reply2"] "translation": "english_translation_of_question_&_correct_reply" }`;

    const result = this.getExerciseFromApi(exercisePrompt);
    //TODO: add setCompleteTheConversation function in learn-generator-utils
    return genUtil.convertToExerciseObject(result,ExerciseType.CompleteTheConversation, language);
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

    const exercisePrompt = `Generate a "match the words" exercise in ${language}, ${difficulty} difficulty. ${numOfPairs} pairs. "correctPairs": { ["word","translation"] }`;

    const result = this.getExerciseFromApi(exercisePrompt);

    return genUtil.convertToExerciseObject(result,ExerciseType.MatchTheWords,language);
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

    const exercisePrompt = `generate a sentence, in ${language}, ${difficulty} difficulty. { "answer": "", "translation": "" }`;

    const result = this.getExerciseFromApi(exercisePrompt);
    return genUtil.convertToExerciseObject(result,ExerciseType.ReorderSentence,language);
  }

  generateMatchTheCategory(language: Language, difficulty: Difficulty, keyWords: string[]) {
    const exercisePrompt = `generate 2 categories and 3 words for each, in ${language}, ${difficulty} difficulty. { "cat_a": "", "cat_b": "", "words_a":[], "words_b":[] }`;

    const result = this.getExerciseFromApi(exercisePrompt);
    return genUtil.convertToExerciseObject(result,ExerciseType.MatchTheCategory,language);
  }

  getExerciseFromApi(promptString: string): Observable<object> {
    const {href} = new URL('generateLesson', this.apiUrl);

    // API CONNECTION
    return this.http.post(href,{userPrompt: promptString});

    // PLACEHOLDER DATA
      // console.log(this.promptString());
      // this.exercises.set(genUtil.convertToExerciseArray(this.mockLesson, language));
      // obs.next(this.exercises());
      // obs.complete();
  }

}
