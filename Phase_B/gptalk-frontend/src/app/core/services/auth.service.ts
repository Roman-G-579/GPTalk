import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({
	providedIn: 'root',
})
export class AuthService {
  private readonly apiUrl = `${environment.apiUrl}/auth`;
  private readonly http = inject(HttpClient);

  login(email: string, password: string): Observable<unknown> {
    return this.http.post<unknown>(`${this.apiUrl}/login`, { email, password });
  }

  getProtectedData(): Observable<unknown> {
    return this.http.get<unknown>(`${this.apiUrl}/protected`);
  }
}
