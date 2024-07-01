import {CommonModule} from "@angular/common";
import {ChangeDetectionStrategy, Component, inject, OnInit, signal} from '@angular/core';
import {LearnService} from "../../core/services/learn.service";
import {Language} from "../../../models/enums/language";
import {Difficulty} from "../../../models/enums/difficulty";

@Component({
  selector: 'app-learn',
  standalone: true,
  imports: [
    CommonModule,
  ],
  templateUrl: './learn.component.html',
  styleUrl: './learn.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LearnComponent implements OnInit {
  private readonly learnService = inject(LearnService);

  exerciseData = signal<{question: string,choices: string[], answer: string}>({
    question: '',
    choices: [],
    answer: ''
  })
  ngOnInit() {
    this.learnService.generateExercise(Language.English, Difficulty.Very_Easy).subscribe({
      next: data => {
        const exercise = data as {question: string,choices: string[], answer: string}

        this.exerciseData.set(exercise);
        console.log(this.exerciseData())
      },
      error: err => {
        console.log("Error! Cannot generate exercise")
      }
    })
  }
}
