import {CommonModule} from "@angular/common";
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  OnInit,
  signal,
  ViewChild,
} from '@angular/core';
import {LearnService} from "../../core/services/learn.service";
import {Language} from "../../../models/enums/language";
import {Difficulty} from "../../../models/enums/difficulty";
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { closest, distance } from 'fastest-levenshtein';
import { Button } from 'primeng/button';
import { PrimeNGConfig } from 'primeng/api';

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

  inputForm = new FormControl(''); // Answer input field
  @ViewChild("inputField") inputFieldRef!: ElementRef;

  exerciseData = signal<{instructions: string, question: string,choices: string[], answer: string}>({
    instructions: '',
    question: '',
    choices: [],
    answer: ''
  })
  resultString = signal<string>("");

  ngOnInit() {
    this.learnService.generateLesson(Language.English, Difficulty.Very_Easy).subscribe({
      next: data => {
        const exercise = data as {instructions: string, question: string,choices: string[], answer: string}

        this.exerciseData.set(exercise);
      },
      error: err => {
        console.log("Error! Cannot generate exercise")
      }
    })
    this.primengConfig.ripple = true;

  }

  ngAfterViewInit() {
    // Once the content has been loaded, force focus on the input field
    if (this.inputFieldRef) {
      this.inputFieldRef.nativeElement.focus();
    }
  }


  // Compares the user's chosen answer with the exercise's actual answer
  // If the answer was manually entered, the string is used in the comparison
  submitAnswer(answer: string) {
    let chosenAnswer;

    // If the answer was submitted by manually typing it
    if (this.inputForm.value) {

      // Approximates the input string to the closest matching option
      chosenAnswer = this.findClosestString(answer);
    }
    // If the answer was submitted by clicking on one of the choices
    else {
      chosenAnswer = answer;
    }

    if(chosenAnswer == this.exerciseData().answer ) {
      this.resultString.set(`${answer}  ->  ${chosenAnswer}  is correct`);
      return true;
    }
    else {
      this.resultString.set(`${answer} is incorrect`);
      return false;
    }
  }

  // Finds the closest matching string (from the available choices) to the given input
  findClosestString(str: string) {

    // If the given string does start with the first letter of the answer, dismiss the answer
    if (!this.exerciseData().answer.startsWith(str[0])) {
      return null;
    }
    // If the string is too different from any given choice, the answer counts as invalid
    if (this.getClosestDistance(str) > 2) {
      return null;
    }

    return closest(str, this.exerciseData().choices)
  }

  // Returns the smallest Levenshtein distance value between the given string and the strings in the choices array
  getClosestDistance(str: string) {
    let dist = 4; // Initial distance value

    this.exerciseData().choices.forEach(choice => {
      let curDist = distance(str, choice);

      //update the smallest distance value if a smaller one than the current minimum is found
      if (curDist < dist) {
        dist = curDist;
      }
    });
    return dist;
  }

  // Refocuses on the text input element (used whenever the element loses focus)
  forceFocus() {
    if (this.inputFieldRef) {
      this.inputFieldRef.nativeElement.focus();
    }
  }


}
