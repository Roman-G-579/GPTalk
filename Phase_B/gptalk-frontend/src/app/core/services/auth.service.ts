import { Injectable, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { UserResponse } from '../../../models/user-response';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly apiUrl = `${environment.apiUrl}auth`;
  private readonly http = inject(HttpClient);

  // Stores the details of the user that is currently logged in
  userData = signal<UserResponse>({
    message: '',
    user: {
      __v: 0,
      _id: '',
      createdAt: new Date(),
      email: '',
      firstName: '',
      lastName: '',
      password: '',
      username: ''
    }
  })

  // Calls the login middleware function, with the given email and password as parameters
  login(email: string, password: string): Observable<unknown> {
    return this.http.post<unknown>(`${this.apiUrl}/login`, { email, password });
  }

  //
  getProtectedData(): Observable<unknown> {
    return this.http.get<unknown>(`${this.apiUrl}/protected`).pipe(
      tap({
        next: (data: unknown) => {
          const protectedData = data as UserResponse;
          this.userData.set(protectedData); //stores the protected data in a signal
        },
        error: (err: any) => {
          console.log("Error fetching protected data", err);
        }
      })
    )
  }
}
