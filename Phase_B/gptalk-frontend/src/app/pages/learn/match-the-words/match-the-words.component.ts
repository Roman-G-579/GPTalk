import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { LearnHtmlUtils } from '../../../core/utils/learn-html-utils';
import { LearnVerificationUtils } from '../../../core/utils/learn-verification-utils';
import { LearnInitializerUtils as init } from '../../../core/utils/learn-initializer-utils';
import { LearnService } from '../../../core/services/learn.service';
import { Button } from 'primeng/button';

@Component({
  selector: 'app-match-the-words',
  standalone: true,
  imports: [
    Button,
  ],
  templateUrl: './match-the-words.component.html',
  styleUrl: './match-the-words.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MatchTheWordsComponent implements OnInit, AfterViewInit {

  protected readonly utilHtml = LearnHtmlUtils;
  protected readonly vrf = LearnVerificationUtils;

  protected readonly lrn = inject(LearnService);


  exerciseData = this.lrn.exerciseData;
  isDone = this.lrn.isDone;
  isCorrectAnswer = this.lrn.isCorrectAnswer;

  // Contains boolean pairs that signify whether the matches are correct or not
  matchResults = signal<[boolean,boolean][]>([]);
  // Contains the current chosen pair of words in the "match the words" exercise
  chosenPair = signal<[string, string]>(["",""]);
  matchMistakes = signal<number>(0); // Counts the number of wrong matches

  ngOnInit() {
    init.initializeMatchResults(this.matchResults, this.matchMistakes, this.exerciseData);
  }

  ngAfterViewInit() {
    // Calls the initializer again whenever another matchTheWords exercise appears in the lesson
    this.lrn.onExerciseSwitch.subscribe(() => {
      init.initializeMatchResults(this.matchResults, this.matchMistakes, this.exerciseData);
    })
  }

  /**
   *
   * Saves the user's word selections in the "match the words" exercise
   *
   * Used by exercise types: MatchTheWords
   * @param str the word in the selected button
   * @param indexOfPair the index of the selected word: 0 - left word, 1 - right word
   */
  chooseMatch(str: string, indexOfPair: number) {
    //Updates the left or right chosen element, based on the given index
    this.chosenPair.update( pair => {
      indexOfPair == 0 ? pair[0] = str : pair[1] = str;
      return pair;
    });

    // If a left and a right word has been selected, call the verifyMatch function
    if (this.chosenPair()[0] && this.chosenPair()[1]) {
      // Get a verify result string from the verifyMatch function
      const matchResult = this.vrf.verifyMatch(this.chosenPair, this.matchResults, this.exerciseData);
      // Exercise complete
      if ( matchResult == "allMatchesFound") {
        this.lrn.setExerciseResult(true);
      }
      // The match was incorrect
      else if (matchResult == "wrongMatch") {
        this.matchMistakes.update(value => value + 1);
      }
      this.chosenPair.set(["",""]); // Resets the chosen pair
    }
  }
}
