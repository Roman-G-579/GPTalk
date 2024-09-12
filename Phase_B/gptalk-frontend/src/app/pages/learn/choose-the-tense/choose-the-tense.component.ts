import {ChangeDetectionStrategy, Component, inject} from '@angular/core';
import {LearnHtmlUtils} from "../utils/learn-html.utils";
import {LearnVerificationUtils} from "../utils/learn-verification.utils";
import {LearnService} from "../learn.service";
import {Button} from "primeng/button";
import {DividerModule} from "primeng/divider";

@Component({
  selector: 'app-choose-the-tense',
  standalone: true,
  imports: [
    Button,
    DividerModule
  ],
  templateUrl: './choose-the-tense.component.html',
  styleUrl: './choose-the-tense.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChooseTheTenseComponent {

  protected readonly utilHtml = LearnHtmlUtils;
  protected readonly vrf = LearnVerificationUtils;

  protected readonly lrn = inject(LearnService);

  exerciseData = this.lrn.exerciseData;
  lessonLanguage = this.lrn.lessonLanguage;
  isExerciseDone = this.lrn.isExerciseDone;
  isCorrectAnswer = this.lrn.isCorrectAnswer;

  choices = [
    {
      value: 'past',
      icon: 'pi pi-backward'
    },
    {
      value: 'present',
      icon: 'pi pi-chevron-down'
    },
    {
      value: 'future',
      icon: 'pi pi-forward'
    },
  ]
}
