import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MyProfileService } from './my-profile.service';
import { ProfileDetailsComponent } from './components/profile-details/profile-details.component';
import { ProfileStatisticsComponent } from './components/profile-statistics/profile-statistics.component';
import { ProfileAchievementsComponent } from './components/profile-achievements/profile-achievements.component';
import { ProfileLanguagesComponent } from './components/profile-languages/profile-languages.component';
import { ProfileLatestResultsComponent } from './components/profile-latest-results/profile-latest-results.component';
import { LoadingComponent } from 'src/app/core/common/loading/loading.component';

@Component({
	selector: 'app-my-profile',
	standalone: true,
	imports: [
		CommonModule,
		ProfileDetailsComponent,
		ProfileStatisticsComponent,
		ProfileAchievementsComponent,
		ProfileLanguagesComponent,
		ProfileLatestResultsComponent,
    LoadingComponent,
	],
	templateUrl: './my-profile.component.html',
	styleUrl: './my-profile.component.scss',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MyProfileComponent {
	private readonly myProfileService = inject(MyProfileService);
	myProfile$ = this.myProfileService.getUserProfile();
}
