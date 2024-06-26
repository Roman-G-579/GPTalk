/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable } from '@angular/core';
import {
	CanActivate,
	ActivatedRouteSnapshot,
	RouterStateSnapshot,
	UrlTree,
	Router,
} from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable({
	providedIn: 'root',
})
export class AuthGuard implements CanActivate {
	constructor(
		private authService: AuthService,
		private router: Router,
	) {}

	canActivate(
		_route: ActivatedRouteSnapshot,
		_state: RouterStateSnapshot,
	): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
		const token = localStorage.getItem('token');

		if (token) {
			return true;
		} else {
			this.router.navigate(['/login']);
			return false;
		}
	}
}
