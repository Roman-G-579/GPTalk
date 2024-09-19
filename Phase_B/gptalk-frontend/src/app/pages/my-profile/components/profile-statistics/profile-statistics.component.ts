import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
	selector: 'app-profile-statistics',
	standalone: true,
	imports: [CommonModule],
	templateUrl: './profile-statistics.component.html',
	styleUrl: './profile-statistics.component.scss',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileStatisticsComponent {
	streak = input(0);
	lessons = input(0);
	exp = input(0);
}
