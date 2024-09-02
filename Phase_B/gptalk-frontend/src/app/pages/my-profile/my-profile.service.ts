import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { environment } from '../../../environments/environment';
import { UserProfile } from './interfaces/user-profile.interface';

@Injectable({
	providedIn: 'root',
})
export class MyProfileService {
	private readonly authService = inject(AuthService);
	private readonly http = inject(HttpClient);
	private readonly apiUrl = `${environment.apiUrl}`;

	getUserProfile(): Observable<UserProfile> {
		const email = this.authService.userData().email;
		const { href } = new URL(`profile/${email}`, this.apiUrl);
		return this.http.get<UserProfile>(href);
	}
}
