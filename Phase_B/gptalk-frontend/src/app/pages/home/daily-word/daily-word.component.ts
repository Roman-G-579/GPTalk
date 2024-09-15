import {
	ChangeDetectionStrategy,
	Component,
	computed,
	inject,
	OnInit,
	WritableSignal,
} from '@angular/core';
import { AvatarModule } from 'primeng/avatar';
import { PanelModule } from 'primeng/panel';
import { PrimeTemplate } from 'primeng/api';
import { Language } from '../../../core/enums/language.enum';
import { DailyWordService } from './daily-word.service';
import { AnimationOptions, LottieComponent } from 'ngx-lottie';
import { LearnHtmlUtils } from '../../learn/utils/learn-html.utils';

@Component({
	selector: 'app-daily-word',
	standalone: true,
	imports: [AvatarModule, PanelModule, PrimeTemplate, LottieComponent],
	templateUrl: './daily-word.component.html',
	styleUrl: './daily-word.component.scss',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DailyWordComponent implements OnInit {
	private readonly wtd = inject(DailyWordService);

	languageIconRecord: Record<Language, string> = {
		English: 'assets/profile/languages/english.png',
		Spanish: 'assets/profile/languages/spanish.png',
		Russian: 'assets/profile/languages/russian.png',
		Hebrew: 'assets/profile/languages/hebrew.png',
		NOT_SELECTED: 'assets/profile/languages/english.png',
	};

	dailyWord = this.wtd.dailyWord;
	isLoading = this.wtd.isLoading;

	language = this.wtd.language;

	translationLanguage = this.wtd.translationLanguage;

	// The lottie file path of the loading animation
	loadingOptions: AnimationOptions = {
		path: '/assets/lottie/loading.json',
	};

	ngOnInit() {
		this.wtd.getDailyWord().then();
	}

	protected readonly utilHtml = LearnHtmlUtils;
}
