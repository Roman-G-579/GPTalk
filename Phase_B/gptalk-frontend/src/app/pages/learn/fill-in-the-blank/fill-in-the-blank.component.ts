import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, inject, ViewChild } from '@angular/core';
import { LearnHtmlUtils } from '../../../core/utils/learn-html-utils';
import { LearnVerificationUtils } from '../../../core/utils/learn-verification-utils';
import { Button } from 'primeng/button';
import { PaginatorModule } from 'primeng/paginator';
import { LearnService } from '../../../core/services/learn.service';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-fill-in-the-blank',
  standalone: true,
  imports: [
    Button,
    PaginatorModule,
    ReactiveFormsModule,
  ],
  templateUrl: './fill-in-the-blank.component.html',
  styleUrl: './fill-in-the-blank.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FillInTheBlankComponent implements AfterViewInit {

	protected readonly utilHtml = LearnHtmlUtils;
	protected readonly vrf = LearnVerificationUtils;

  inputForm = new FormControl(''); // Answer input field
  @ViewChild("inputField") inputFieldRef!: ElementRef;

  protected readonly lrn = inject(LearnService);

  exerciseData = this.lrn.exerciseData;
  isDone = this.lrn.isDone;
  isCorrectAnswer = this.lrn.isCorrectAnswer;

  ngAfterViewInit() {
    // Calls the initializer again whenever another fillInTheBlank exercise appears in the lesson
    this.lrn.onExerciseSwitch.subscribe(() => {
      this.inputForm.patchValue("");
    })  }
}
