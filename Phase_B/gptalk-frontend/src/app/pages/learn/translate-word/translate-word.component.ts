import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { LearnHtmlUtils } from '../../../core/utils/learn-html.utils';
import { LearnVerificationUtils } from '../../../core/utils/learn-verification.utils';
import { Button } from 'primeng/button';
import { LearnService } from '../../../core/services/learn.service';

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
  isDone = this.lrn.isDone;
  isCorrectAnswer = this.lrn.isCorrectAnswer;
}
