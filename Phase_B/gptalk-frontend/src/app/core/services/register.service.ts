import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RegisterService {
  private readonly http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  registerUser(userData: unknown): Observable<object> {
    const {href} = new URL('register', this.apiUrl);

    return this.http.post(href, userData);
  }
}
