import {CommonModule} from "@angular/common";
import {
  AfterViewInit,
  ChangeDetectionStrategy, ChangeDetectorRef,
  Component,
  ElementRef,
  inject,
  OnInit,
  signal, TemplateRef,
  ViewChild,
} from '@angular/core';
import {LearnService} from "../../core/services/learn.service";
import {Language} from "../../../models/enums/language.enum";
import {Difficulty} from "../../../models/enums/difficulty.enum";
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { closest, distance } from 'fastest-levenshtein';
import { Button } from 'primeng/button';
import { PrimeNGConfig } from 'primeng/api';
import { ExerciseType } from '../../../models/enums/exercise-type.enum';
import { Exercise } from '../../../models/exercise.interface';
import { indexOf } from 'lodash';

@Component({
  selector: 'app-learn',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    Button,
  ],
  templateUrl: './learn.component.html',
  styleUrl: './learn.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LearnComponent implements OnInit, AfterViewInit {
  private readonly learnService = inject(LearnService);
  private readonly primengConfig = inject(PrimeNGConfig);
  private readonly cdr = inject(ChangeDetectorRef);

  @ViewChild('fillInTheBlank') fillInTheBlankTemplate!: TemplateRef<unknown>;
  @ViewChild('translateWord') translateWordTemplate!: TemplateRef<unknown>;
  @ViewChild('writeTheSentence') writeTheSentenceTemplate!: TemplateRef<unknown>;
  @ViewChild('completeTheConversation') completeTheConversationTemplate!: TemplateRef<unknown>;
  @ViewChild('matchTheWords') matchTheWordsTemplate!: TemplateRef<unknown>;

  inputForm = new FormControl(''); // Answer input field
  @ViewChild("inputField") inputFieldRef!: ElementRef;

  isDone = signal<Boolean>(false); // Changes to true once an exercise is over
  isCorrectAnswer = signal<Boolean>(false); // Changes to true if user answers correctly
  chosenAnswer = signal<string>(""); // Contains the submitted answer

  // Contains boolean pairs that signify whether the matches are correct or not
  matchResults = signal<[Boolean,Boolean][]>([]);
  // Contains the current chosen pair of words in the "match the words" exercise
  chosenPair = signal<[string, string]>(["",""]);
  mistakesCounter = signal(0); // Counts the number of wrong matches

  headingText = signal<string>(""); // Contains instructions or feedback

  exerciseData = signal<Exercise>({
    type:  0,
    instructions: '',
    question: '',
    choices: [],
    correctWordPairs: [],
    randomizedWordPairs: [],
    answer: ''
  })

  // Returns a ng-template reference based on the current exercise type
  getTemplate() {
    switch (this.exerciseData().type) {
      case ExerciseType.FillInTheBlank:
        return this.fillInTheBlankTemplate;
      case ExerciseType.TranslateWord:
        return this.translateWordTemplate;
      case ExerciseType.WriteTheSentence:
        return this.writeTheSentenceTemplate;
      case ExerciseType.CompleteTheConversation:
        return this.completeTheConversationTemplate;
      case ExerciseType.MatchTheWords:
        return this.matchTheWordsTemplate;
      default:
        return null;
    }
  }


  ngOnInit() {
    this.learnService.generateLesson(Language.English, Difficulty.Very_Easy).subscribe({
      next: data => {
        const exercise = data as Exercise

        this.exerciseData.set(exercise);
        this.lowerCaseAll();
        if (exercise.type == ExerciseType.MatchTheWords) {
          this.initializeMatchResults();
        }

        this.headingText.set(exercise.instructions);
      },
      error: err => {
        console.log("Error! Cannot generate exercise")
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


  // Compares the user's chosen answer with the exercise's actual answer
  // If the answer was manually entered, the string is used in the comparison
  submitAnswer(answer: string) {
    answer = answer.toLowerCase();
    this.chosenAnswer.set(answer);

    // If the answer was submitted by manually typing it
    if (this.inputForm.value) {

      // Approximates the input string to the closest matching option
      this.chosenAnswer.set(<string>this.findClosestString(answer));
    }

    this.isDone.set(true);

    if(this.chosenAnswer() == this.exerciseData().answer ) {
      this.headingText.set(`Correct!`);
      this.isCorrectAnswer.set(true);
    }
    else {
      this.headingText.set(`${answer} is incorrect.`);
      this.isCorrectAnswer.set(false);
    }
  }

  // Saves the user's word selections in the "match the words" exercise
  chooseMatch(str: string, indexOfPair: number) {
    //Updates the left or right chosen element, based on the given index
    this.chosenPair.update( pair => {
      indexOfPair == 0 ? pair[0] = str : pair[1] = str;
      return pair;
    });

    (this.chosenPair()[0] && this.chosenPair()[1]) ? this.verifyMatch() : null;
  }

  // Checks if the chosen pair matches a pair in the answer array
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
        console.log("You Win");
        this.isDone.set(true);
      }
    }
    else {
      this.mistakesCounter.set(this.mistakesCounter() + 1);

      if (this.mistakesCounter() == 3) {
        console.log("You Lose");
        this.isDone.set(true);
      }
    }

    this.chosenPair.set(["",""]); // Resets the chosen pair
  }

  // Finds the closest matching string (from the available choices) to the given input
  findClosestString(str: string) {

    // If the given string doesn't start with the first letter of the answer, dismiss the answer
    if (!this.exerciseData().answer?.startsWith(str[0])) {
      return null;
    }
    // If the string is too different from any given choice, the answer counts as invalid
    if (this.getClosestDistance(str) > 2) {
      return null;
    }

    return closest(str, this.exerciseData().choices ?? []);
  }

  // Returns the smallest Levenshtein distance value between the given string and the strings in the choices array
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

  // Returns true if the HTML element that called the function contains the correct answer
  elemContainsAnswer(choice: string): boolean {
    return this.exerciseData().answer === choice;
  }

  // Refocuses on the text input element (used whenever the element loses focus)
  forceFocus() {
    if (this.inputFieldRef) { //If the input element is active
      this.inputFieldRef.nativeElement.focus();
    }
  }

  // Converts every question and answer related string to lowercase for easier comparisons
  lowerCaseAll() {
    this.exerciseData.update( data => {
      data.question = data.question?.toLowerCase();
      data.answer = data.answer?.toLowerCase();
      data.choices = data.choices?.map(elem => elem.toLowerCase());
      data.correctWordPairs = data.correctWordPairs?.map(pair => [pair[0].toLowerCase(), pair[1].toLowerCase()]);
      data.randomizedWordPairs = data.randomizedWordPairs?.map(pair => [pair[0].toLowerCase(), pair[1].toLowerCase()]);
      return data;
    })
  }

  // Initializes an array of match results equal to the size of word pairs in the generated exercise
  initializeMatchResults() {
    this.matchResults.update(data => {
      this.exerciseData()?.randomizedWordPairs?.forEach(item => {
        data.push([false,false]);
      });
      return data;
    })
  }


  protected readonly indexOf = indexOf;
}
