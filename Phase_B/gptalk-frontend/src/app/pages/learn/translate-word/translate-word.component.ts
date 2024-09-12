import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { LearnHtmlUtils } from '../utils/learn-html.utils';
import { LearnVerificationUtils } from '../utils/learn-verification.utils';
import { Button } from 'primeng/button';
import { LearnService } from '../learn.service';

@Component({
  selector: 'app-translate-word',
  standalone: true,
  imports: [
    Button,
  ],
  templateUrl: './translate-word.component.html',
  styleUrl: './translate-word.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TranslateWordComponent {

  protected readonly utilHtml = LearnHtmlUtils;
  protected readonly vrf = LearnVerificationUtils;

  protected readonly lrn = inject(LearnService);

  exerciseData = this.lrn.exerciseData;
  isExerciseDone = this.lrn.isExerciseDone;
  isCorrectAnswer = this.lrn.isCorrectAnswer;
}
