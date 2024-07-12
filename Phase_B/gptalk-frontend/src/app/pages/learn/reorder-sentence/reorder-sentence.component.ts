import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { LearnHtmlUtils } from '../../../core/utils/learn-html-utils';
import { LearnVerificationUtils } from '../../../core/utils/learn-verification-utils';
import { LearnService } from '../../../core/services/learn.service';
import { Button } from 'primeng/button';

@Component({
  selector: 'app-reorder-sentence',
  standalone: true,
  imports: [
    Button,
  ],
  templateUrl: './reorder-sentence.component.html',
  styleUrl: './reorder-sentence.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReorderSentenceComponent implements AfterViewInit {

  protected readonly utilHtml = LearnHtmlUtils;
  protected readonly vrf = LearnVerificationUtils;

  protected readonly lrn = inject(LearnService);

  exerciseData = this.lrn.exerciseData;
  isDone = this.lrn.isDone;
  isCorrectAnswer = this.lrn.isCorrectAnswer;

  // Contains an array of strings that are used to construct the answer sentence
  // in the ReorderSentence exercise
  chosenWords = signal<string[]>([]);

  ngAfterViewInit() {
    // Calls the initializer again whenever another reorderSentence exercise appears in the lesson
    this.lrn.onExerciseSwitch.subscribe(() => {
      this.chosenWords.set([]);
    })
  }

  /**
   * Toggles the selection of a word from the full string in the current exercise
   *
   * Used by exercises: ReorderSentence
   * @param index the index of the word to be toggled
   */
  toggleWordSelection(index: number) {
    const choice = <string>this.exerciseData().choices?.at(index);

    // Toggle the selection state of the current word
    this.chosenWords.update(data => {
      if (!data.includes(choice)) {
        data.push(choice);
      }
      else {
        data.splice(data.indexOf(choice),1);
      }
      return data;
    })
  }

  /**
   * Removes the selection from the chosenWords array
   * @param index the index of the word to be removed
   */
  removeWord(index: number) {
    const chosenWord = <string>this.chosenWords().at(index);

    this.chosenWords.update( data => {
      data.splice(data.indexOf(chosenWord), 1);
      return data;
    })
  }
}
