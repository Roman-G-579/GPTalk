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
import { distance } from 'fastest-levenshtein';
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
import { BypassSecurityPipe } from '../../../pipes/bypass-security.pipe';
import { LearnMiscUtils as util } from '../../core/utils/learn-misc-utils';
import { LearnHtmlUtils } from '../../core/utils/learn-html-utils';
import { LearnVerificationUtils, LearnVerificationUtils as vrf } from '../../core/utils/learn-verification-utils';

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
    BypassSecurityPipe,
  ],
  templateUrl: './learn.component.html',
  styleUrl: './learn.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LearnComponent implements OnInit, AfterViewInit {
  private readonly learnService = inject(LearnService);
  private readonly primengConfig = inject(PrimeNGConfig);
  private readonly cdr = inject(ChangeDetectorRef);
  protected readonly utilHtml = LearnHtmlUtils; // Used by HTML template to access html-related utils
  protected readonly vrf = LearnVerificationUtils;

  @ViewChild('fillInTheBlank') fillInTheBlankTemplate!: TemplateRef<unknown>;
  @ViewChild('translateWord') translateWordTemplate!: TemplateRef<unknown>;
  @ViewChild('translateTheSentence') translateTheSentenceTemplate!: TemplateRef<unknown>;
  @ViewChild('completeTheConversation') completeTheConversationTemplate!: TemplateRef<unknown>;
  @ViewChild('matchTheWords') matchTheWordsTemplate!: TemplateRef<unknown>;

  inputForm = new FormControl(''); // Answer input field
  @ViewChild("inputField") inputFieldRef!: ElementRef;

  isDone = signal<boolean>(false); // Changes to true once an exercise is over
  isLessonOver = signal<boolean>(false); // Changes to true once the lesson is over
  isCorrectAnswer = signal<boolean>(false); // Changes to true if user answers correctly

  // -- MatchTheWords-specific variables --
  // Contains boolean pairs that signify whether the matches are correct or not
  matchResults = signal<[boolean,boolean][]>([]);
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
    instructions: '',
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
  }

  /**
   * Sets up the data and parameters for the next exercise in the lesson
   */
  setUpNextExercise() {
    // Retrieves the next exercise from the array
    const curExercise = this.exerciseArr.length ? this.exerciseArr.shift() : util.displayResultsScreen(this.isLessonOver);

    util.resetSignals(this.isDone,this.isCorrectAnswer);
    this.inputForm.patchValue("");

    // Sets the exercise data in the signal
    if (curExercise) {
      this.exerciseData.set(curExercise);
    }

    // Normalizes the exercise's strings for easier comparison
    util.lowerCaseAndNormalizeAll(this.exerciseData);

    // Initializes a matchResults array for the "match the words exercise"
    if (this.exerciseData().type == ExerciseType.MatchTheWords) {
      util.initializeMatchResults(this.matchResults, this.exerciseData);
    }

    this.headingText.set(this.exerciseData().type); //Exercise type contains a relevant header string

    // Once the content has been loaded, force focus on the input field, if it exists in the selected template
    if (this.inputFieldRef) {
      this.inputFieldRef.nativeElement.focus();
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
    if (this.chosenPair()[0] && this.chosenPair()[1]) {
      // If the verifyMatch function returns true, the exercise is done
      vrf.verifyMatch(this.chosenPair, this.matchResults, this.exerciseData) ? this.setExerciseResult(true) : null;
      this.chosenPair.set(["",""]); // Resets the chosen pair
    }

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
      util.incrementCorrectAnswers(this.correctAndTotalExercises);
    }
    else {
      this.headingText.set(`Incorrect.`);
    }
  }

}
