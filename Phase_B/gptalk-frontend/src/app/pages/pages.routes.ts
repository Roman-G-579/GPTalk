import { Route } from '@angular/router';

export default [
	{
		path: '',
		loadComponent: () => import('./pages.component').then((c) => c.PagesComponent),
	},
  {
    path: 'register',
    loadComponent: () => import('./register/register.component').then((c) => c.RegisterComponent),
  },
] as Route[];
