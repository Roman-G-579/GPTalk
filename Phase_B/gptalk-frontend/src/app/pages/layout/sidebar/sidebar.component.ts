import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth.service';
import { ConfirmationService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { LearnService } from '../../learn/learn.service';

@Component({
	selector: 'app-sidebar',
	standalone: true,
	imports: [CommonModule, RouterLink, RouterLinkActive, ConfirmDialogModule],
	providers: [ConfirmationService],
	templateUrl: './sidebar.component.html',
	styleUrl: './sidebar.component.scss',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidebarComponent {
	private readonly authService = inject(AuthService);
	private readonly router = inject(Router);
	private readonly confirmationService = inject(ConfirmationService);
	protected readonly lrn = inject(LearnService);

	pages = [
		{
			name: 'Home',
			icon: 'pi pi-home',
			route: '/pages/home',
		},
		{
			name: 'Learn',
			icon: 'pi pi-lightbulb',
			route: '/pages/learn',
		},
		{
			name: 'Chat With Me',
			icon: 'pi pi-comment',
			route: '/pages/chat-with-me',
		},
		{
			name: 'Leaderboard',
			icon: 'pi pi-chart-bar',
			route: '/pages/leaderboard',
		},
		{
			name: 'My Profile',
			icon: 'pi pi-user',
			route: '/pages/my-profile',
		},
		{
			name: 'About',
			icon: 'pi pi-info-circle',
			route: '/pages/about',
		},
		{
			name: 'Log Out',
			icon: 'pi pi-sign-out',
			route: '#',
		},
	];

	logout() {
		this.authService.logout();
		this.router.navigate(['/login']).then();
	}

	navigate(page: { name: string; icon: string; route: string }) {
		if (
			(this.router.url === '/pages/learn' && !page.route.includes('/learn')) ||
			(this.router.url === '/pages/chat-with-me' && !page.route.includes('chat-with-me'))
		) {
			this.showConfirmation(page);
		} else {
			if (page.name !== 'Log Out') {
				this.router.navigate([page.route]).then();
			} else {
				this.logout();
			}
		}
	}

	/**
	 * Opens a dialog window displaying the grade given to the user for the current session
	 * @param page the grade (1 to 100) given by the chatbot
	 */
	showConfirmation(page: { name: string; icon: string; route: string }) {
		this.confirmationService.confirm({
			message: `You have an active session. Are you sure you want to leave this page? Your progress will be lost!`,
			accept: () => {
				if (this.router.url === '/pages/learn') {
					// Undo gained exp before exit
					this.lrn.totalExp.update((exp) => {
						exp -= this.lrn.lessonExp();
						return exp;
					});
					this.lrn.endLesson();
				}
				this.router.navigateByUrl(page.route).then();
			},
			reject: () => {},
		});
	}
}
