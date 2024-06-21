import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class RegisterService {
  private registerUrl = environment.apiUrl + '/register';

  constructor(private http: HttpClient) { }

  registerUser(userData: any) {
    return this.http.post(this.registerUrl, userData);
  }
}
