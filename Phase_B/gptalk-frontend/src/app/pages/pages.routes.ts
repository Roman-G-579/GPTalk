import { Route } from '@angular/router';

export default [
	{
		path: '',
		redirectTo: 'home',
		pathMatch: 'full',
	},
	{
		path: 'home',
		loadComponent: () => import('./home/home.component').then((c) => c.HomeComponent),
	},
	{
		path: 'learn',
		loadComponent: () => import('./learn/learn.component').then((c) => c.LearnComponent),
	},
	{
		path: 'daily-task',
		loadComponent: () =>
			import('./daily-task/daily-task.component').then((c) => c.DailyTaskComponent),
	},
	{
		path: 'chat-with-me',
		loadComponent: () =>
			import('./chat-with-me/chat-with-me.component').then((c) => c.ChatWithMeComponent),
	},
	{
		path: 'leaderboard',
		loadComponent: () =>
			import('./leaderboard/leaderboard.component').then((c) => c.LeaderboardComponent),
	},
	{
		path: 'my-profile',
		loadComponent: () =>
			import('./my-profile/my-profile.component').then((c) => c.MyProfileComponent),
	},
	{
		path: 'about',
		loadComponent: () => import('./about/about.component').then((c) => c.AboutComponent),
	},
] as Route[];
