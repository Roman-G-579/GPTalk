import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth.service';

@Component({
	selector: 'app-sidebar',
	standalone: true,
	imports: [CommonModule, RouterLink, RouterLinkActive],
	templateUrl: './sidebar.component.html',
	styleUrl: './sidebar.component.scss',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidebarComponent {
	private readonly authService = inject(AuthService);
	private readonly router = inject(Router);

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
			name: 'Daily Tasks',
			icon: 'pi pi-list-check',
			route: '/pages/daily-task',
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
		this.router.navigate(['/login']);
	}
}
