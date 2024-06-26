import { Route } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';

export default [
	{
		path: '',
		redirectTo: 'login',
		pathMatch: 'full',
	},
	// {
	// 	path: 'pages',
	// 	canActivate: [AuthGuard],
	// 	loadChildren: () => import('./pages/pages.routes'),
	// },
	{
		path: 'login',
		loadComponent: () => import('./login/login.component').then((c) => c.LoginComponent),
	},
	{
		path: 'protected',
		canActivate: [AuthGuard],
		loadComponent: () =>
			import('./protected/protected.component').then((c) => c.ProtectedComponent),
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
