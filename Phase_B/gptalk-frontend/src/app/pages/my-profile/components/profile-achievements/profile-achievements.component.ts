import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { ProgressBarModule } from 'primeng/progressbar';
import { UserAchievement } from '../../interfaces/user-achievements.interface';

@Component({
	selector: 'app-profile-achievements',
	standalone: true,
	imports: [CommonModule, ProgressBarModule],
	templateUrl: './profile-achievements.component.html',
	styleUrl: './profile-achievements.component.scss',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileAchievementsComponent {
	achievements = input<UserAchievement[]>([]);
}
