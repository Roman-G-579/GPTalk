import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnimationOptions, LottieComponent } from 'ngx-lottie';
import { ToastrService } from 'ngx-toastr';
import { TableModule } from 'primeng/table';
import { LeaderboardService } from './leaderboard.service';
import { MiscUtils } from '../../../app/core/utils/misc.utils';
import { LeadboardRow } from './leaderboard.interface';
import { UserAvatarComponent } from '../../../app/core/common/user-avatar/user-avatar.component';
import { SinceDatePipe } from '../../../app/core/pipes/since-date.pipe';

@Component({
	selector: 'app-leaderboard',
	standalone: true,
	imports: [CommonModule, LottieComponent, UserAvatarComponent, SinceDatePipe, TableModule],
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

	ngOnInit() {
		this.leaderboardService.getLeaderboard().subscribe({
			next: (res: { top3Users: LeadboardRow[]; top4To10Users: LeadboardRow[] }) => {
				this.top3Users.set(res.top3Users);
				this.top4To10Users.set(res.top4To10Users);
			},
			error: () => this.toastr.error('Error occured!', 'Error!'),
		});
	}
}
