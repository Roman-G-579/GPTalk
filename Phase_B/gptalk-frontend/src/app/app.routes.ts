import { Route } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';

export default [
	{
		path: '',
		redirectTo: 'pages',
		pathMatch: 'full',
	},
	{
		path: 'pages',
		canActivate: [AuthGuard],
		loadChildren: () => import('./pages/pages.routes'),
	},
	{
		path: 'error',
		loadComponent: () => import('./error/error.component').then((c) => c.ErrorComponent),
	},
	{
		path: '**',
		redirectTo: '',
	},
] as Route[];
