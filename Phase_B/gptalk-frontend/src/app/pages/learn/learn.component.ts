import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit, signal,
} from '@angular/core';
import { LessonGeneratorService } from './lesson-generator.service';
import { Language } from '../../../models/enums/language.enum';
import { Difficulty } from '../../../models/enums/difficulty.enum';
import { Button } from 'primeng/button';
import { PrimeNGConfig } from 'primeng/api';
import { Exercise } from '../../../models/exercise.interface';
import { LearnService } from './learn.service';
import { BypassSecurityPipe } from '../../../pipes/bypass-security.pipe';
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

@Component({
  selector: 'app-learn',
  standalone: true,
  imports: [
    CommonModule,
    Button,
    BypassSecurityPipe,
    ExpBarComponent,
    LottieComponent,
  ],
  templateUrl: './learn.component.html',
  styleUrl: './learn.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LearnComponent implements OnInit {
  private readonly lgService = inject(LessonGeneratorService);
  protected readonly lrn = inject(LearnService);
  private readonly primengConfig = inject(PrimeNGConfig);

  isLoading = signal<boolean>(true);
  isDone = this.lrn.isDone;
  isLessonOver = this.lrn.isLessonOver;

  headingText = this.lrn.headingText; // Contains instructions or feedback

  exerciseData = this.lrn.exerciseData;
  lessonLanguage = this.lrn.lessonLanguage;

  // The lottie file path of the loading animation
  loadingOptions: AnimationOptions = {
    path: '/assets/lottie/loading.json'
  };
  ngOnInit() {
    this.lgService.generateLesson(Language.Hebrew, Difficulty.Medium, 2).subscribe({
      next: (exercises: Exercise[]) => {
        this.lrn.setUpLesson(exercises);
        //TODO: change method of setting current lesson's language
        this.lessonLanguage.set(Language.Hebrew);
        this.isLoading.set(false);
      }
    })

    this.primengConfig.ripple = true;

  }

  // All exercise components
  private components = [
    FillInTheBlankComponent,
    TranslateWordComponent,
    TranslateTheSentenceComponent,
    CompleteTheConversationComponent,
    MatchTheWordsComponent,
    ReorderSentenceComponent,
    MatchTheCategoryComponent
  ]

  // Returns a component based on the current exercise type
  get currentExercise() {
    if (!this.isLessonOver()) {
      return this.components[this.exerciseData().type];
    }
    return ResultsScreenComponent;
  }

}
