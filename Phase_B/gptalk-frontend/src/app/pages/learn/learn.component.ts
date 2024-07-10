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
  ViewChild,
} from '@angular/core';
import { LearnService } from '../../core/services/learn.service';
import { Language } from '../../../models/enums/language.enum';
import { Difficulty } from '../../../models/enums/difficulty.enum';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
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
import { LearnInitializerUtils as init} from '../../core/utils/learn-initializer-utils';
import { LearnHtmlUtils } from '../../core/utils/learn-html-utils';
import { LearnVerificationUtils, LearnVerificationUtils as vrf } from '../../core/utils/learn-verification-utils';
import { RouterLink } from '@angular/router';
import { DragDropModule } from 'primeng/dragdrop';

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
    RouterLink,
    DragDropModule,
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
  @ViewChild('reorderSentence') reorderSentenceTemplate!: TemplateRef<unknown>;
  @ViewChild('matchTheCategory') matchTheCategoryTemplate!: TemplateRef<unknown>;
  @ViewChild('resultsScreen') resultsScreenTemplate!: TemplateRef<unknown>;

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

  // Contains an array of strings that are used to construct the answer sentence
  // in the ReorderSentence exercise
  chosenWords = signal<string[]>([]);

  // -- MatchTheCategory-specific variables --
  categoryMatches = signal<{categories: [string,string], wordBank: string[], cat1: string[], cat2: string[]}>({
    categories: ["",""],
    wordBank: [],
    cat1: [],
    cat2: []
  })
  draggedWord = signal<string>("");

  counters = signal<{correctAnswers: number, totalExercises: number, matchMistakes: number}>({
    correctAnswers: 0,
    totalExercises: 0,
    matchMistakes: 0
  })

  headingText = signal<string>(""); // Contains instructions or feedback

  // Array of the generated exercises returned by the learn service
  exerciseArr!: Exercise[];
  // Data of the current exercise
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

  // Contains mapping to every exercise template in the Learn component
  private getTemplateMap(): {[key: number]: TemplateRef<unknown> } {
    return {
      0: this.fillInTheBlankTemplate,
      1: this.translateWordTemplate,
      2: this.translateTheSentenceTemplate,
      3: this.completeTheConversationTemplate,
      4: this.matchTheWordsTemplate,
      5: this.reorderSentenceTemplate,
      6: this.matchTheCategoryTemplate
    };
  }

  // Returns a TemplateRef based on the current exercise type
  getTemplate(): TemplateRef<unknown> {
    const templateMap = this.getTemplateMap();
    if (!this.isLessonOver()) {
      return templateMap[this.exerciseData().type] || null;
    }
    else {
      return this.resultsScreenTemplate;
    }
  }

  ngOnInit() {
    this.learnService.generateLesson(Language.English, Difficulty.Very_Easy, 5).subscribe({
      next: data => {
        this.exerciseArr = data as Exercise[];
        this.counters.set({correctAnswers: 0, totalExercises: data.length, matchMistakes: 0});

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
    const curExercise = this.exerciseArr.length ? this.exerciseArr.shift() : null;

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
   * Resets the fields and states, and runs the relevant initializer functions
   */
  runInitializers() {
    // Resets the states of all exercise-data related signals
    init.resetSignals(this.isDone, this.isCorrectAnswer, this.chosenWords);

    // Resets the match mistakes counter
    init.resetMatchMistakes(this.counters);

    // Resets the input field's value
    this.inputForm.patchValue("");

    // Normalizes the exercise's strings for easier comparison
    util.lowerCaseAndNormalizeAll(this.exerciseData);

    // Initializes a matchResults array for the "match the words" exercise
    if (this.exerciseData().type == ExerciseType.MatchTheWords) {
      init.initializeMatchResults(this.matchResults, this.exerciseData);
    }

    // Initializes a pair of categories for the "match the category" exercise
    if (this.exerciseData().type == ExerciseType.MatchTheCategory) {
      init.initializeMatchTheCategory(this.categoryMatches, this.exerciseData);
    }

    // Sets the current exercise's heading string
    this.headingText.set(this.exerciseData().heading ?? '');

    // Once the content has been loaded, force focus on the input field, if it exists in the selected template
    if (this.inputFieldRef) {
      this.inputFieldRef.nativeElement.focus();
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
      // Get a verify result string from the verifyMatch function
      const matchResult = vrf.verifyMatch(this.chosenPair, this.matchResults, this.exerciseData);
      // Exercise complete
      if ( matchResult == "allMatchesFound") {
        this.setExerciseResult(true)
      }
      // The match was incorrect
      else if (matchResult == "wrongMatch") {
        util.incrementCounters(this.counters, 0, 1);
      }
      this.chosenPair.set(["",""]); // Resets the chosen pair
    }
  }

  /**
   * Toggles the selection of a word from the full string in the current exercise
   *
   * Used by exercises: ReorderSentence
   * @param index the index of the word to be toggled
   */
  toggleWordSelection(index: number) {
    const choice = <string>this.exerciseData().choices?.at(index);

    // Toggle the selection state of the current word
    this.chosenWords.update(data => {
      if (!data.includes(choice)) {
        data.push(choice);
      }
      else {
        data.splice(data.indexOf(choice),1);
      }
      return data;
    })
  }


  /**
   * Handles the start of the drag event
   *
   * Used by exercises: MatchTheCategory
   * @param word the value of the element being dragged
   */
  dragStart(word: string) {
    this.draggedWord.set(word);
  }

  /**
   * Clears the draggedWord value, signifying the end of a drag event
   *
   * Used by exercises: MatchTheCategory
   */
  dragEnd() {
    this.draggedWord.set("");
  }

  /**
   * Handles the drop part of a drag-and-drop event by moving the item
   * that called the method to one of the category containers
   *
   * Used by exercises: MatchTheCategory
   * @param catIndex the index of the category represented by the target category container
   */
  drop(catIndex: number) {
    const draggedWord = this.draggedWord();
    if (!draggedWord) return;

    const cat1Arr = this.categoryMatches().cat1;
    const cat2Arr = this.categoryMatches().cat2;
    const wordBankArr = this.categoryMatches().wordBank;

    // Moves draggedWord from one array to the other
    const addToCategory = (targetArr: string[], otherArr: string[]) => {
      // If the word is not in this category already, add it
      if (!targetArr.includes(draggedWord)) {
        targetArr.push(draggedWord);
      }
      // Remove word from the other category
      if (otherArr.includes(draggedWord)) {
        otherArr.splice(otherArr.indexOf(draggedWord),1);
      }
      // Remove word from word bank
      if (wordBankArr.includes(draggedWord)) {
        wordBankArr.splice(wordBankArr.indexOf(draggedWord),1);
      }
    }
    // Move word to the array of the category matching the given index
    catIndex == 0 ? addToCategory(cat1Arr, cat2Arr) : addToCategory(cat2Arr, cat1Arr);

    // Updates the categories and wordBank arrays
    this.categoryMatches.update(data => {
      data.cat1 = cat1Arr;
      data.cat2 = cat2Arr;
      data.wordBank = wordBankArr;
      return data;
    })
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

      util.incrementCounters(this.counters, 1, 0);
    }
    else {
      this.headingText.set(`Incorrect.`);
    }
  }

}
