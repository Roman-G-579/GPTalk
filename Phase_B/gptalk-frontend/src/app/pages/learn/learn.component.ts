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

  isSubmitted = signal<Boolean>(false); // Changes to true once an answer is submitted
  chosenAnswer = signal<string>(""); // Contains the submitted answer
  headingText = signal<string>(""); // Contains instructions or feedback

  exerciseData = signal<Exercise>({
    type:  0,
    instructions: '',
    question: '',
    choices: [],
    wordPairs: [],
    randomizedWordPairs: [],
    answer: ''
  })

  // Returns a ng-template reference based on the exercise type
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

        console.log(this.exerciseData());
        this.headingText.set(exercise.instructions);
      },
      error: err => {
        console.log("Error! Cannot generate exercise")
      }
    })
    this.primengConfig.ripple = true;

  }

  ngAfterViewInit() {

    this.cdr.detectChanges();

    // Once the content has been loaded, force focus on the input field
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

    this.isSubmitted.set(true);

    if(this.chosenAnswer() == this.exerciseData().answer ) {
      this.headingText.set(`${answer}  ->  ${this.chosenAnswer()}  is correct`)
    }
    else {
      this.headingText.set(`${answer} is incorrect`);
    }
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
  // TODO: adjust logic to handle cases where user selects incorrect answer
  isCorrect(choice: string): boolean {
    return this.exerciseData().answer === choice && choice === this.chosenAnswer();
  }

  // Refocuses on the text input element (used whenever the element loses focus)
  forceFocus() {
    if (this.inputFieldRef) {
      this.inputFieldRef.nativeElement.focus();
    }
  }

  lowerCaseAll() {
    this.exerciseData.update( data => {
      data.question = data.question?.toLowerCase();
      data.answer = data.answer?.toLowerCase();
      data.choices = data.choices?.map(elem => elem.toLowerCase());
      data.wordPairs = data.wordPairs?.map(pair => [pair[0].toLowerCase(), pair[1].toLowerCase()]);
      data.randomizedWordPairs = data.randomizedWordPairs?.map(pair => [pair[0].toLowerCase(), pair[1].toLowerCase()]);
      return data;
    })

  }


}
