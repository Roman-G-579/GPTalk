import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

@UntilDestroy()
@Component({
	selector: 'app-error',
	standalone: true,
	imports: [CommonModule],
	templateUrl: './error.component.html',
	styleUrls: ['./error.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ErrorComponent {
	router = inject(Router);

	constructor() {
		this.handleRefreshEvent();
	}

	handleRefreshEvent() {
		this.router.events
			.pipe(
				// filter only navigation and events
				filter((event): event is NavigationEnd => event instanceof NavigationEnd),

				// filter if true, means refresh occured
				filter((event) => event.id === 1 && event.url === event.urlAfterRedirects),

				untilDestroyed(this),
			)
			.subscribe({
				next: () => this.router.navigate(['/']),
			});
	}
}
