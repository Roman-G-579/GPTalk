import { ChangeDetectionStrategy, ChangeDetectorRef, Component, computed, inject, signal } from '@angular/core';
import { ProgressBarModule } from 'primeng/progressbar';
import { PrimeTemplate } from 'primeng/api';
import { NgClass } from '@angular/common';
import { LearnService } from '../../../core/services/learn.service';
import { AuthService } from '../../../core/services/auth.service';
import {MiscUtils as util} from '../../../core/utils/misc-utils';

@Component({
  selector: 'app-exp-bar',
  standalone: true,
  imports: [
    ProgressBarModule,
    PrimeTemplate,
    NgClass,
  ],
  templateUrl: './exp-bar.component.html',
  styleUrl: './exp-bar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExpBarComponent {

  protected readonly lrn = inject(LearnService);
  protected readonly authService = inject(AuthService);
  protected readonly cdr = inject(ChangeDetectorRef);

  isDone = this.lrn.isDone;
  totalExp = this.authService.totalExp;
  level = this.authService.level;

  progressVal = computed(() => {
    const totalExp = this.totalExp();
    const expForNextLevel = util.calculateExpForNextLevel(this.level());
    const expAtLevelStart = expForNextLevel / 2;

    return (totalExp - expAtLevelStart) / (expForNextLevel - expAtLevelStart) * 100;
  });

  /**
   * Calculates the required amount of experience points
   * needed for the next level, based on the user's current level
   */
  calculateExpForNextLevel(){
      return (100 * Math.pow(2, this.level()-1));
  }

}
