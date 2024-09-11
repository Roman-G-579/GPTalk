import {ChangeDetectionStrategy, Component, inject, OnInit, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {AnimationOptions, LottieComponent} from 'ngx-lottie';
import {ToastrService} from 'ngx-toastr';
import {LeaderboardService} from './leaderboard.service';
import {MiscUtils} from '../../core/utils/misc.utils';
import {LeadboardRow} from './leaderboard.interface';
import {UserAvatarComponent} from '../../core/common/user-avatar/user-avatar.component';
import {SinceDatePipe} from '../../core/pipes/since-date.pipe';
import {LoadingComponent} from 'src/app/core/common/loading/loading.component';
import {Language} from "../../core/enums/language.enum";
import {SplitButtonModule} from "primeng/splitbutton";
import {DropdownModule} from "primeng/dropdown";
import {FormsModule} from "@angular/forms";

@Component({
	selector: 'app-leaderboard',
	standalone: true,
  imports: [CommonModule, LottieComponent, UserAvatarComponent, SinceDatePipe, LoadingComponent, SplitButtonModule, DropdownModule, FormsModule],
	templateUrl: './leaderboard.component.html',
	styleUrl: './leaderboard.component.scss',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LeaderboardComponent implements OnInit {
	private readonly leaderboardService = inject(LeaderboardService);
	private readonly toastr = inject(ToastrService);
	top3Users = signal<LeadboardRow[]>([]);
	top4To10Users = signal<LeadboardRow[]>([]);
	loading = signal(false);
	calculateLevelFunc = MiscUtils.calculateLevel;

	medalOptions: AnimationOptions[] = [
		{ path: '/assets/lottie/gold-medal.json' },
		{ path: '/assets/lottie/silver-medal.json' },
		{ path: '/assets/lottie/bronze-medal.json' },
	];

  languageIconRecord: Record<string, string> = {
    English: 'assets/profile/languages/english.png',
    Spanish: 'assets/profile/languages/spanish.png',
    Russian: 'assets/profile/languages/russian.png',
    Hebrew: 'assets/profile/languages/hebrew.png',
    NOT_SELECTED: 'assets/profile/languages/global.png',
  };

  languages = [
    {
      name: Language.English,
      icon: this.languageIconRecord[Language.English],
    },
    {
      name: Language.Spanish,
      icon: this.languageIconRecord[Language.Spanish],
    },
    {
      name: Language.Russian,
      icon: this.languageIconRecord[Language.Russian],
    },
    {
      name: Language.Hebrew,
      icon: this.languageIconRecord[Language.Hebrew],
    },
    {
      name: 'Global',
      icon: this.languageIconRecord[Language.NOT_SELECTED],
    }
  ];

  selectedLanguage = this.languages[4];

	ngOnInit() {
    this.getLeaderboardByLanguage(Language.NOT_SELECTED);
	}

  /**
   * Gets a leaderboard object of the top 10 users, filtered by the given language
   * If a 'global' language is given, the overall top 10 users will be retrieved (without a language filter)
   * @param language the filtered language
   */
  getLeaderboardByLanguage(language: Language | string) {
    if (language == 'Global') { language = Language.NOT_SELECTED; }

    this.leaderboardService.getLeaderboard(language as Language).subscribe({
      next: (res: { top3Users: LeadboardRow[]; top4To10Users: LeadboardRow[] }) => {
        this.top3Users.set(res.top3Users);
        this.top4To10Users.set(res.top4To10Users);
      },
      error: () => this.toastr.error('Error occurred!', 'Error!'),
    });
  }

  protected readonly Language = Language;
}
