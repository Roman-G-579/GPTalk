import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  inject,
  OnInit,
  signal,
  TemplateRef,
  ViewChild, WritableSignal,
} from '@angular/core';
import { LearnService } from '../../core/services/learn.service';
import { Language } from '../../../models/enums/language.enum';
import { Difficulty } from '../../../models/enums/difficulty.enum';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { closest, distance } from 'fastest-levenshtein';
import { Button } from 'primeng/button';
import { PrimeNGConfig } from 'primeng/api';
import { ExerciseType } from '../../../models/enums/exercise-type.enum';
import { Exercise } from '../../../models/exercise.interface';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { TimelineModule } from 'primeng/timeline';
import { CardModule } from 'primeng/card';
import { FieldsetModule } from 'primeng/fieldset';
import { AvatarModule } from 'primeng/avatar';
import { StyleClassModule } from 'primeng/styleclass';

@Component({
  selector: 'app-learn',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    Button,
    InputTextareaModule,
    TimelineModule,
    CardModule,
    FieldsetModule,
    AvatarModule,
    StyleClassModule,
  ],
  templateUrl: './learn.component.html',
  styleUrl: './learn.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LearnComponent implements OnInit, AfterViewInit {
  private readonly learnService = inject(LearnService);
  private readonly primengConfig = inject(PrimeNGConfig);
  private readonly cdr = inject(ChangeDetectorRef);
  protected readonly ExerciseType = ExerciseType; // Used by template for evaluation

  @ViewChild('fillInTheBlank') fillInTheBlankTemplate!: TemplateRef<unknown>;
  @ViewChild('translateWord') translateWordTemplate!: TemplateRef<unknown>;
  @ViewChild('translateTheSentence') translateTheSentenceTemplate!: TemplateRef<unknown>;
  @ViewChild('completeTheConversation') completeTheConversationTemplate!: TemplateRef<unknown>;
  @ViewChild('matchTheWords') matchTheWordsTemplate!: TemplateRef<unknown>;

  inputForm = new FormControl(''); // Answer input field
  @ViewChild("inputField") inputFieldRef!: ElementRef;

  isDone = signal<Boolean>(false); // Changes to true once an exercise is over
  isLessonOver = signal<Boolean>(false); // Changes to true once the lesson is over
  isCorrectAnswer = signal<Boolean>(false); // Changes to true if user answers correctly

  // -- MatchTheWords-specific variables --
  // Contains boolean pairs that signify whether the matches are correct or not
  matchResults = signal<[Boolean,Boolean][]>([]);
  // Contains the current chosen pair of words in the "match the words" exercise
  chosenPair = signal<[string, string]>(["",""]);

  // Counts the number of correct answers in the lesson
  correctAndTotalExercises = signal<[number,number]>([0,0]);

  // Counts the number of wrong matches in the "match the words" exercise
  matchMistakesCnt = signal(0);

  headingText = signal<string>(""); // Contains instructions or feedback

  // Array of the generated exercises returned by the learn service
  exerciseArr!: Exercise[];
  // Data of the current exercise
  exerciseData = signal<Exercise>({
    type: ExerciseType.FillInTheBlank,
    language: Language.English,
    question: '',
    choices: [],
    correctWordPairs: [],
    randomizedWordPairs: [],
    answer: '',
    translation: ''
  })

  // Returns a ng-template reference based on the current exercise type
  getTemplate() {
    switch (this.exerciseData().type) {
      case ExerciseType.FillInTheBlank:
        return this.fillInTheBlankTemplate;
      case ExerciseType.TranslateWord:
        return this.translateWordTemplate;
      case ExerciseType.TranslateTheSentence:
        return this.translateTheSentenceTemplate;
      case ExerciseType.CompleteTheConversation:
        return this.completeTheConversationTemplate;
      case ExerciseType.MatchTheWords:
        return this.matchTheWordsTemplate;
      default:
        return null;
    }
  }


  ngOnInit() {
    this.learnService.generateLesson(Language.English, Difficulty.Very_Easy, 3).subscribe({
      next: data => {
        this.exerciseArr = data as Exercise[];
        this.correctAndTotalExercises.set([0,data.length]); // Initialize the total exercise amount

        this.setUpNextExercise();
      },
      error: err => {
        console.log("Error! Cannot generate exercise. ", err)
      }
    })
    this.primengConfig.ripple = true;

  }

  ngAfterViewInit() {

    this.cdr.detectChanges(); // Performs a detection change to update the templateRef of the current exercise

    // Once the content has been loaded, force focus on the input field, if it exists in the selected template
    if (this.inputFieldRef) {
      this.inputFieldRef.nativeElement.focus();
    }
  }

  /**
   * Sets up the data and parameters for the next exercise in the lesson
   */
  setUpNextExercise() {
    const curExercise = this.exerciseArr.length ? this.exerciseArr.shift() : this.displayResultsScreen(); // Retrieves the next exercise from the array

    this.resetSignals();

    // Sets the exercise data in the signal
    if (curExercise) {
      this.exerciseData.set(curExercise);
    }

    // Normalizes the exercise's strings for easier comparison
    this.lowerCaseAndNormalizeAll(this.exerciseData);

    // Initializes a matchResults array for the "match the words exercise"
    if (this.exerciseData().type == ExerciseType.MatchTheWords) {
      this.initializeMatchResults();
    }

    this.headingText.set(this.exerciseData().type); //Exercise type contains a relevant instruction string

  }

  displayResultsScreen() {
    this.isLessonOver.set(true);
  }

  /**
   * Compares the user's chosen answer with the exercise's actual answer
   * If the answer was manually entered, the string is used in the comparison
   *
   * Used by exercise types: FillInTheBlank, TranslateWord, CompleteTheConversation
   * @param answer  the answer submitted by the user for verification
   */
  submitAnswer(answer: string) {
    answer = answer.toLowerCase().trim().normalize();

    // If the answer was submitted by manually typing it
    if (this.inputForm.value) {
      // Approximates the input string to the closest matching option
      answer = this.findClosestString(answer);
    }

    if(answer == this.exerciseData().answer ) {
      this.setExerciseResult(true);
    }
    else {
      this.setExerciseResult(false);
    }
  }

  /**
   * Compares the user's translation of a sentence with the actual answer
   *
   * Used by exercise type: WriteTheSentence
   * @param userInput the string submitted by the user for verification
   */
  submitTranslatedSentence(userInput: string) {
    // Normalizing the user's answer and the actual answer, removing any punctuation marks
    userInput = userInput.toLowerCase().trim().replace(/[,.!?:]/g,'').normalize();
    const actualAnswer = this.exerciseData().answer?.replace(/[,.!?:]/g,'') ?? "";

    // Exact match
    if(userInput == actualAnswer ) {
      this.setExerciseResult(true);
    }
    // Close match (3 or fewer characters apart)
    else if(distance(userInput, actualAnswer) < 4) {
      this.setExerciseResult(true);
    }
    else {
      this.setExerciseResult(false);
    }
  }

  /**
   *
   * Saves the user's word selections in the "match the words" exercise
   *
   * Used by exercise types: MatchTheWords
   * @param str the word in the selected button
   * @param indexOfPair the index of the selected word: 0 - left word, 1 - right word
   */
  chooseMatch(str: string, indexOfPair: number) {

    //Updates the left or right chosen element, based on the given index
    this.chosenPair.update( pair => {
      indexOfPair == 0 ? pair[0] = str : pair[1] = str;
      return pair;
    });

    // If a left and a right word has been selected, call the verifyMatch function
    (this.chosenPair()[0] && this.chosenPair()[1]) ? this.verifyMatch() : null;
  }

  /**
   * Checks if the chosen pair matches a pair in the answer array
   *
   * Used by exercise types: MatchTheWords
   */
  verifyMatch() {
    const leftWord = this.chosenPair()[0];
    const rightWord = this.chosenPair()[1];

    // If the correct pairs array includes the pair [leftWord, rightWord], a match has been found
    if (this.exerciseData().correctWordPairs?.some(([left,right]) => left == leftWord && right == rightWord)) {

      // Update the result pairs array to reflect the found match (used to highlight a correct match on the screen)
      this.matchResults.update(data => {
        // Get the indices of both matching words in the words array
        const leftIdx = this.exerciseData().randomizedWordPairs?.findIndex(([left,]) => left == leftWord) ?? -1;
        const rightIdx = this.exerciseData().randomizedWordPairs?.findIndex(([,right]) => right == rightWord) ?? -1;

        // Update the match results array at the corresponding indices
        if (leftIdx != -1 && rightIdx != -1) {
          data[leftIdx][0] = true;
          data[rightIdx][1] = true;
        }
        return data;
      });

      // If all booleans in the match results array are 'true', the exercise is complete
      if (!this.matchResults().some(([left,right]) => left == false || right == false)) {
        this.matchMistakesCnt() == 0 ? this.headingText.set(`Correct!`) : this.headingText.set(`Number of mistakes: ${this.matchMistakesCnt()}`);
        this.setExerciseResult(true);
      }
    }
    else {
      this.matchMistakesCnt.set(this.matchMistakesCnt() + 1);

      // TODO: for each mistake deduct exp reward of current exercise

    }

    this.chosenPair.set(["",""]); // Resets the chosen pair
  }

  /**
   * Marks the current exercise as "done", sets the result,
   * updates the number of correct answers in the lesson, and adds XP
   * if the answer was correct
   * @param status exercise result - true means "correct", false means "incorrect"
   */
  setExerciseResult(status: Boolean) {
    this.isDone.set(true);
    this.isCorrectAnswer.set(status);

    if (status == true) {
      this.headingText.set(`Correct!`);
      //TODO: Add XP for correct answer
      this.correctAndTotalExercises.update(cntArr => {
        cntArr[0] += 1;
        return cntArr;
      });
    }
    else {
      this.headingText.set(`Incorrect.`);
    }
  }

  /**
   * Finds the closest matching string (from the available choices) to the given input
   *
   * Used by exercise types: FillInTheBlank, CompleteTheConversation
   * @param str the string that will be evaluated
   */
  findClosestString(str: string) {

    // If the given string doesn't start with the first letter of the answer, dismiss the answer
    if (!this.exerciseData().answer?.startsWith(str[0])) {
      return "";
    }

    // If the string is too different from any given choice, the answer counts as invalid
    if (this.getClosestDistance(str) > 2) {
      return "";
    }

    return closest(str, this.exerciseData().choices ?? []);
  }

  /**
   * Returns the smallest Levenshtein distance value
   * between the given string and the strings in the choices array
   *
   * Used by exercise types: FillInTheBlank, CompleteTheConversation
   * @param str the string that will be evaluated
   */
  getClosestDistance(str: string) {
    let dist = Infinity; // Initial distance value

    this.exerciseData().choices?.forEach(choice => {
      let curDist = distance(str, choice);

      //update the smallest distance value if a smaller one than the current minimum is found
      if (curDist < dist) {
        dist = curDist;
      }
    });
    return dist;
  }

  /**
   * Returns true if the HTML element that called the function contains the correct answer
   * @param choice the string displayed on the element that called the function
   */
  elemContainsAnswer(choice: string): boolean {
    return this.exerciseData().answer === choice;
  }

  /**
   * Refocuses on the text input element (used whenever the element loses focus)
   */
  forceFocus() {
    if (this.inputFieldRef) { //If the input element is active
      this.inputFieldRef.nativeElement.focus();
    }
  }

  /**
   * Converts every question and answer related string to normalized and lowercase for easier comparisons
   */
  lowerCaseAndNormalizeAll(exercise: WritableSignal<Exercise>) {
    exercise.update( data => {
      data.question = data.question?.normalize().toLowerCase();
      data.answer = data.answer?.normalize().toLowerCase();
      data.choices = data.choices?.map(elem => elem.normalize().toLowerCase());
      data.correctWordPairs = data.correctWordPairs?.map(pair => [pair[0].normalize().toLowerCase(), pair[1].normalize().toLowerCase()]);
      data.randomizedWordPairs = data.randomizedWordPairs?.map(pair => [pair[0].normalize().toLowerCase(), pair[1].normalize().toLowerCase()]);
      return data;
    })
  }

  /**
   * Initializes an array of match results equal to the size of word pairs in the generated exercise
   */
  initializeMatchResults() {
    this.matchResults.update(data => {
      this.exerciseData()?.randomizedWordPairs?.forEach(()=>
        data.push([false, false])
      );
      return data;
    })
  }

  /**
   * Resets the states of all exercise-data related signals
   */
  resetSignals() {
    this.isDone.set(false);
    this.isCorrectAnswer.set(false);
    this.matchResults.set([]);
    this.inputForm.patchValue("");
  }

  protected readonly distance = distance;
}
