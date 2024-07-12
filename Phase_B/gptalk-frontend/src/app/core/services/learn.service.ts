import { EventEmitter, Injectable, signal } from '@angular/core';
import { Exercise } from '../../../models/exercise.interface';
import { ExerciseType } from '../../../models/enums/exercise-type.enum';
import { Language } from '../../../models/enums/language.enum';
import { LearnMiscUtils as util } from '../utils/learn-misc-utils';
import { LearnInitializerUtils as init } from '../utils/learn-initializer-utils';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LearnService {

  // Signals child components that the active exercise has changed
  onExerciseSwitch = new Subject();

  // Booleans
  isDone = signal<boolean>(false); // Changes to true once an exercise is over
  isLessonOver = signal<boolean>(false); // Changes to true once the lesson is over
  isCorrectAnswer = signal<boolean>(false); // Changes to true if user answers correctly

  // Counters
  mistakesCounter = signal<number>(0); // Counts the mistakes in the lesson's exercises
  totalExercises = signal<number>(0); // Stores the total amount of exercises in the current lesson

  headingText = signal<string>(""); // Contains instructions or exercise feedback

  exerciseArr = signal<Exercise[]>([]);

  exerciseData = signal<Exercise>({
    type: ExerciseType.FillInTheBlank,
    language: Language.English,
    heading: '',
    instructions: '',
    question: '',
    choices: [""],
    correctPairs: [],
    randomizedPairs: [],
    answer: '',
    translation: ''
  })

  /**
   * Sets up the data and parameters for the current lesson
   * @param exercisesArr the array of generated exercises
   */
  setUpLesson(exercisesArr: Exercise[]) {
    this.exerciseArr.set(exercisesArr);
    this.totalExercises.set(exercisesArr.length); // Sets the exercises count

    init.initializeLessonParams(this.isLessonOver,this.mistakesCounter);

   this.setUpNextExercise();
  }
  /**
   * Sets up the data and parameters for the next exercise in the lesson
   */
  setUpNextExercise() {
    // Retrieves the next exercise from the array
    const curExercise = this.exerciseArr().length
      ?
      util.exerciseArrShift(this.exerciseArr)
      :
      null;

    if (curExercise) {
      // Sets the data in the exerciseData signal
      this.exerciseData.set(curExercise);

      this.runInitializers();
    }
    else {
      this.displayResultsScreen();
    }
  }

  /**
   * Prepares the signal values for the results screen at the end of a lesson
   */
  displayResultsScreen() {
    this.headingText.set(`Lesson finished`);
    this.isLessonOver.set(true);
    this.isDone.set(true);
  }

  /**
   * Resets the fields and states, and runs the relevant initializer functions
   */
  runInitializers() {
    // Resets the states of all exercise-data related signals
    this.isDone.set(false);
    this.isCorrectAnswer.set(false);

    // Signals the child components to call their exercise-specific initializers
    this.onExerciseSwitch.next(true);

    // init.resetSignals(this.isDone, this.isCorrectAnswer, this.chosenWords);

    // Resets the match mistakes counter
    // init.resetMatchMistakes(this.counters);

    // Resets the input field's value
    // this.inputForm.patchValue("");

    // Normalizes the exercise's strings for easier comparison
    util.lowerCaseAndNormalizeAll(this.exerciseData);

    // Initializes a pair of categories for the "match the category" exercise
    // if (this.exerciseData().type == ExerciseType.MatchTheCategory) {
    //   init.initializeMatchTheCategory(this.categoryMatches, this.exerciseData);
    // }

    // Sets the current exercise's heading string
    this.headingText.set(this.exerciseData().heading ?? '');

    // Once the content has been loaded, force focus on the input field, if it exists in the selected template
    // if (this.inputFieldRef) {
    //   this.inputFieldRef.nativeElement.focus();
    // }
  }

  /**
   * Marks the current exercise as "done", sets the result,
   * updates the number of correct answers in the lesson, and adds XP
   * if the answer was correct
   * @param status exercise result - true means "correct", false means "incorrect"
   */
  setExerciseResult(status: boolean) {
    this.isDone.set(true);
    this.isCorrectAnswer.set(status);

    if (status) {
      this.headingText.set(`Correct!`);

      //TODO: Add XP for correct answer

    }
    else {
      this.headingText.set(`Incorrect.`);
      this.mistakesCounter.update(value => value + 1);
    }
  }
}
