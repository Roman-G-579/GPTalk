import { AfterViewInit, ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { LearnService } from '../learn.service';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { LearnHtmlUtils } from '../utils/learn-html.utils';
import { LearnVerificationUtils } from '../utils/learn-verification.utils';
import { Button } from 'primeng/button';
import {TooltipModule} from "primeng/tooltip";

@Component({
  selector: 'app-translate-the-sentence',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    Button,
    TooltipModule,
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
  lessonLanguage = this.lrn.lessonLanguage;
  isDone = this.lrn.isDone;
  hintText = this.lrn.hintText;

  ngAfterViewInit() {
    this.lrn.onExerciseSwitch.subscribe(() => {
      this.inputForm.patchValue("");
    });
  }

}
