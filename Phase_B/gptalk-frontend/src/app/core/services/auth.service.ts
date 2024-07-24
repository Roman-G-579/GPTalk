import { Injectable, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { UserResponse } from '../../../models/user-response';

@Injectable({
	providedIn: 'root',
})
export class AuthService {
	private readonly apiUrl = `${environment.apiUrl}auth`;
	private readonly http = inject(HttpClient);

	// Stores the details of the user that is currently logged in
	userData = signal<UserResponse>({
		__v: 0,
		_id: '',
		createdAt: new Date(),
		email: '',
		firstName: '',
		lastName: '',
		username: '',
    level: 0,
    userAvatar: '',
	});

	// Calls the login middleware function, with the given email and password as parameters
	login(email: string, password: string): Observable<{ token: string; user: UserResponse }> {
		return this.http
			.post<{ token: string; user: UserResponse }>(`${this.apiUrl}/login`, { email, password })
			.pipe(
				tap({
					next: (data: { token: string; user: UserResponse }) => {
						const protectedData = data.user as UserResponse;
						this.userData.set(protectedData); //stores the protected data in a signal
						console.log(this.userData());
					},
					error: (err: unknown) => {
						console.log('Error fetching protected data', err);
					},
				}),
			);
	}

	// Fetch user data from backend using the stored token
	fetchUserData(token: string): Observable<UserResponse> {
		const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
		return this.http.get<UserResponse>(`${this.apiUrl}/user`, { headers }).pipe(
			tap({
				next: (data: UserResponse) => {
					this.userData.set(data);
				},
				error: (err: unknown) => {
					console.log('Error fetching user data', err);
				},
			}),
		);
	}

	// Clear user data from the service and localStorage
	logout() {
		this.userData.set({
			__v: 0,
			_id: '',
			createdAt: new Date(),
			email: '',
			firstName: '',
			lastName: '',
			username: '',
      level: 0,
      userAvatar: '',
		});
		localStorage.removeItem('token');
	}
}
