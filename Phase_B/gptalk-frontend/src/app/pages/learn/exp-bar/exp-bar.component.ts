import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { ProgressBarModule } from 'primeng/progressbar';
import { PrimeTemplate } from 'primeng/api';
import { NgClass } from '@angular/common';
import { LearnService } from '../learn.service';
import { AuthService } from '../../../core/services/auth.service';
import {MiscUtils as util} from '../../../core/utils/misc.utils';

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

  totalExp = this.authService.totalExp;
  level = this.authService.level;

  progressVal = computed(() => {
    const totalExp = this.totalExp();
    const expForNextLevel = util.calculateExpForNextLevel(this.level());
    const expAtLevelStart = expForNextLevel / 2;

    return (totalExp - expAtLevelStart) / (expForNextLevel - expAtLevelStart) * 100;
  });

}
