import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, inject, ViewChild } from '@angular/core';
import { LearnService } from '../../../core/services/learn.service';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { LearnHtmlUtils } from '../../../core/utils/learn-html-utils';
import { LearnVerificationUtils } from '../../../core/utils/learn-verification-utils';
import { Button } from 'primeng/button';

@Component({
  selector: 'app-translate-the-sentence',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    Button,
  ],
  templateUrl: './translate-the-sentence.component.html',
  styleUrl: './translate-the-sentence.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TranslateTheSentenceComponent implements AfterViewInit {

  protected readonly utilHtml = LearnHtmlUtils;
  protected readonly vrf = LearnVerificationUtils;

  protected readonly lrn = inject(LearnService);

  inputForm = new FormControl(''); // Answer input field

  exerciseData = this.lrn.exerciseData;
  isDone = this.lrn.isDone;

  ngAfterViewInit() {
    this.lrn.onExerciseSwitch.subscribe(() => {
      this.inputForm.patchValue("");
    });
  }

}
