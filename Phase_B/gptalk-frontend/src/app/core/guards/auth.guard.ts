/* eslint-disable */
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { catchError, map, of } from 'rxjs';

export const AuthGuard: CanActivateFn = (route, state) => {
	const router = inject(Router);
	const authService = inject(AuthService);
	return authService.login().pipe(
		map((loginResult) => {
			if (!loginResult) {
				return router.parseUrl('/error');
			}
			return true;
		}),
		catchError((err) => {
			router.navigateByUrl('/error');
			return of(false);
		}),
	);
};
