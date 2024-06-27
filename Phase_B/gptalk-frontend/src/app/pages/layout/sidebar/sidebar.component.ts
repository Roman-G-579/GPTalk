import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
	selector: 'app-sidebar',
	standalone: true,
	imports: [CommonModule, RouterLink, RouterLinkActive],
	templateUrl: './sidebar.component.html',
	styleUrl: './sidebar.component.scss',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidebarComponent {
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
		// {
		// 	name: 'Log Out',
		// 	icon: 'pi pi-sign-out',
		// 	route: '#',
		// },
	];
}
