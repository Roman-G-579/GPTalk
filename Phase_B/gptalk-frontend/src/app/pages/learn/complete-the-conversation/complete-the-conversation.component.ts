import { ChangeDetectionStrategy, Component, ElementRef, inject, ViewChild } from '@angular/core';
import { LearnHtmlUtils } from '../../../core/utils/learn-html.utils';
import { LearnVerificationUtils } from '../../../core/utils/learn-verification.utils';
import { LearnService } from '../learn.service';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Button } from 'primeng/button';

@Component({
  selector: 'app-complete-the-conversation',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    Button,
  ],
  templateUrl: './complete-the-conversation.component.html',
  styleUrl: './complete-the-conversation.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CompleteTheConversationComponent {

  protected readonly utilHtml = LearnHtmlUtils;
  protected readonly vrf = LearnVerificationUtils;

  protected readonly lrn = inject(LearnService);

  inputForm = new FormControl(''); // Answer input field

  exerciseData = this.lrn.exerciseData;
  lessonLanguage = this.lrn.lessonLanguage;
  isDone = this.lrn.isDone;
  isCorrectAnswer = this.lrn.isCorrectAnswer;

}
