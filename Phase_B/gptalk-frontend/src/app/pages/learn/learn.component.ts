import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit, signal,
} from '@angular/core';
import { LessonGeneratorService } from './lesson-generator.service';
import { Language } from '../../core/enums/language.enum';
import { Difficulty } from '../../core/enums/difficulty.enum';
import { Button } from 'primeng/button';
import { PrimeNGConfig } from 'primeng/api';
import { Exercise } from '../../core/interfaces/exercise.interface';
import { LearnService } from './learn.service';
import { BypassSecurityPipe } from '../../core/pipes/bypass-security.pipe';
import { FillInTheBlankComponent } from './fill-in-the-blank/fill-in-the-blank.component';
import { TranslateWordComponent } from './translate-word/translate-word.component';
import { TranslateTheSentenceComponent } from './translate-the-sentence/translate-the-sentence.component';
import { CompleteTheConversationComponent } from './complete-the-conversation/complete-the-conversation.component';
import { MatchTheWordsComponent } from './match-the-words/match-the-words.component';
import { ReorderSentenceComponent } from './reorder-sentence/reorder-sentence.component';
import { MatchTheCategoryComponent } from './match-the-category/match-the-category.component';
import { ResultsScreenComponent } from './results-screen/results-screen.component';
import { ExpBarComponent } from './exp-bar/exp-bar.component';
import { AnimationOptions, LottieComponent } from 'ngx-lottie';
import {LanguageSelectComponent} from "../../core/common/language-select/language-select.component";
import {SummarizeTheParagraphComponent} from "./summarize-the-paragraph/summarize-the-paragraph.component";
import {ChooseTheTenseComponent} from "./choose-the-tense/choose-the-tense.component";

@Component({
  selector: 'app-learn',
  standalone: true,
  imports: [
    CommonModule,
    Button,
    BypassSecurityPipe,
    ExpBarComponent,
    LottieComponent,
    LanguageSelectComponent,
  ],
  templateUrl: './learn.component.html',
  styleUrl: './learn.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LearnComponent implements OnInit {
  private readonly lgService = inject(LessonGeneratorService);
  protected readonly lrn = inject(LearnService);
  private readonly primengConfig = inject(PrimeNGConfig);
  protected readonly Language = Language;

  EXERCISE_AMOUNT = 3;

  isLoading = signal<boolean>(true);
  isDone = this.lrn.isExerciseDone;
  isLessonOver = this.lrn.isLessonOver;

  headingText = this.lrn.headingText; // Contains instructions or feedback

  exerciseData = this.lrn.exerciseData;
  lessonLanguage = this.lrn.lessonLanguage;

  // The lottie file path of the loading animation
  loadingOptions: AnimationOptions = {
    path: '/assets/lottie/loading.json'
  };

  ngOnInit() {
    this.primengConfig.ripple = true;
    this.lrn.isLessonOver.set(false);
  }

  // All exercise components
  private components = [
    FillInTheBlankComponent,
    TranslateWordComponent,
    TranslateTheSentenceComponent,
    CompleteTheConversationComponent,
    MatchTheWordsComponent,
    ReorderSentenceComponent,
    MatchTheCategoryComponent,
    SummarizeTheParagraphComponent,
    ChooseTheTenseComponent
  ]

  // Returns a component based on the current exercise type
  get currentExercise() {
    if (!this.isLessonOver()) {
      return this.components[this.exerciseData().type];
    }
    return ResultsScreenComponent;
  }
  /**
   * Calls the lesson generation function and calls setUpLesson using the generated result
   * @param language the generated lesson's language
   */
  callGenerator(language: Language) {
    this.lrn.lessonLanguage.set(language);
    this.lgService.generateLesson(language, this.lrn.lessonLanguageRank() as Difficulty, this.EXERCISE_AMOUNT).subscribe({
      next: (exercises: Exercise[]) => {
        this.lrn.setUpLesson(exercises);
        this.isLoading.set(false);
      }
    });
  }
}
