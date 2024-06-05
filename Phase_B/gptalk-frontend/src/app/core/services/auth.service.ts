import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

@Injectable({
	providedIn: 'root',
})
export class AuthService {
	login(): Observable<boolean> {
		return of(true);
	}
}
