import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  signal,
  ViewChild,
  WritableSignal
} from '@angular/core';
import { LearnService } from '../learn.service';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { LearnHtmlUtils } from '../utils/learn-html.utils';
import { MiscUtils as util } from "../../../core/utils/misc.utils";
import { LearnVerificationUtils } from '../utils/learn-verification.utils';
import { Button } from 'primeng/button';
import {TooltipModule} from "primeng/tooltip";
import {Exercise} from "../../../core/interfaces/exercise.interface";

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
  @ViewChild('inputArea') inputArea!: ElementRef<HTMLDivElement>;

  protected readonly utilHtml = LearnHtmlUtils;
  protected readonly vrf = LearnVerificationUtils;

  protected readonly lrn = inject(LearnService);

  inputText = "";
  highlightedContent = "";

  exerciseData = this.lrn.exerciseData;
  penalties = this.lrn.penalties;
  lessonLanguage = this.lrn.lessonLanguage;
  isDone = this.lrn.isDone;
  hintText = this.lrn.hintText;

  ngAfterViewInit() {
    // When the active exercise changes, the text area is cleared
    this.lrn.onExerciseSwitch.subscribe(() => {
      if (this.inputArea && this.inputArea.nativeElement) {
        this.inputArea.nativeElement.innerHTML = '';
      }
    });
  }

  /**
   * Updates the input area on keypress
   * @param event the event that triggered the method (keypress)
   */
  onInput(event: Event) {
    this.inputText = (event.target as HTMLElement).innerText;
  }

  /**
   * Submits the user's answer and highlights mistakes if they exist
   */
  submitAnswer() {
    // Verifies the answer and submits result
    this.lrn.setExerciseResult(this.vrf.verifyTranslateSentence(this.inputText,this.exerciseData, this.penalties))

    // highlights the user's mistakes in his input
    this.highlightedContent = this.utilHtml.highlightMistakes(this.inputText,this.exerciseData);
  }

}
