import {ChangeDetectionStrategy, Component, inject} from "@angular/core";
import {ReactiveFormsModule} from "@angular/forms";
import {Button} from "primeng/button";
import {LearnHtmlUtils} from "../utils/learn-html.utils";
import {LearnVerificationUtils} from "../utils/learn-verification.utils";
import {LearnService} from "../learn.service";

@Component({
  selector: 'app-summarize-the-paragraph',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    Button,
  ],
  templateUrl: './summarize-the-paragraph.component.html',
  styleUrl: './summarize-the-paragraph.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SummarizeTheParagraphComponent {

  protected readonly utilHtml = LearnHtmlUtils;
  protected readonly vrf = LearnVerificationUtils;

  protected readonly lrn = inject(LearnService);

  exerciseData = this.lrn.exerciseData;
  lessonLanguage = this.lrn.lessonLanguage;
  isDone = this.lrn.isExerciseDone;
  isCorrectAnswer = this.lrn.isCorrectAnswer;
}
