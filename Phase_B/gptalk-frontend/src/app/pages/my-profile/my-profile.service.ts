import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { environment } from '../../../environments/environment';

@Injectable({
	providedIn: 'root',
})
export class MyProfileService {
	private readonly authService = inject(AuthService);
	private readonly http = inject(HttpClient);
	private readonly apiUrl = `${environment.apiUrl}`;

  //! TODO: add typing
	getUserProfile(): Observable<any> {
		const email = this.authService.userData().email;
		const { href } = new URL(`profile/${email}`, this.apiUrl);
		return this.http.get<any>(href);
	}
}
