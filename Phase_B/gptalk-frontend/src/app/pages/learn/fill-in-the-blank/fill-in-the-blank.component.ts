import { ChangeDetectionStrategy, Component, ElementRef, inject, ViewChild } from '@angular/core';
import { LearnHtmlUtils } from '../utils/learn-html.utils';
import { LearnVerificationUtils } from '../utils/learn-verification.utils';
import { Button } from 'primeng/button';
import { PaginatorModule } from 'primeng/paginator';
import { LearnService } from '../learn.service';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import {AutoFocus} from "primeng/autofocus";

@Component({
  selector: 'app-fill-in-the-blank',
  standalone: true,
  imports: [
    Button,
    PaginatorModule,
    ReactiveFormsModule,
    AutoFocus,
  ],
  templateUrl: './fill-in-the-blank.component.html',
  styleUrl: './fill-in-the-blank.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FillInTheBlankComponent {

	protected readonly utilHtml = LearnHtmlUtils;
	protected readonly vrf = LearnVerificationUtils;

  inputForm = new FormControl(''); // Answer input field
  @ViewChild("inputField") inputFieldRef!: ElementRef;

  protected readonly lrn = inject(LearnService);

  exerciseData = this.lrn.exerciseData;
  lessonLanguage = this.lrn.lessonLanguage;
  isExerciseDone = this.lrn.isExerciseDone;
  isCorrectAnswer = this.lrn.isCorrectAnswer;

}
