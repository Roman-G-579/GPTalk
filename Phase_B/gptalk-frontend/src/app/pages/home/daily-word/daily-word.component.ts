import { ChangeDetectionStrategy, Component, inject, input, Input, OnInit } from '@angular/core';
import { AvatarModule } from 'primeng/avatar';
import { PanelModule } from 'primeng/panel';
import { PrimeTemplate } from 'primeng/api';
import { DailyWord } from '../daily-word.interface';
import { Language } from '../../../../models/enums/language.enum';
import { DailyWordService } from '../daily-word.service';

@Component({
  selector: 'app-daily-word',
  standalone: true,
	imports: [
		AvatarModule,
		PanelModule,
		PrimeTemplate,
	],
  templateUrl: './daily-word.component.html',
  styleUrl: './daily-word.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DailyWordComponent  implements OnInit{
  private readonly wtd = inject(DailyWordService);

  languageIconRecord: Record<Language, string> = {
    English: 'assets/profile/languages/english.png',
    Spanish: 'assets/profile/languages/spanish.png',
    Russian: 'assets/profile/languages/russian.png',
    Hebrew: 'assets/profile/languages/hebrew.png',
  };

  dailyWord = this.wtd.dailyWord;

  ngOnInit() {
    this.wtd.getDailyWord().then();
  }
}
