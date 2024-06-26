import { Route } from '@angular/router';

export default [
	{
		path: '',
		loadComponent: () => import('./pages.component').then((c) => c.PagesComponent),
	},
] as Route[];
