/* eslint-disable @typescript-eslint/no-explicit-any */
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { AuthService } from '../core/services/auth.service';

@Component({
	selector: 'app-login',
	templateUrl: './login.component.html',
	styleUrls: ['./login.component.scss'],
	standalone: true,
	imports: [CommonModule, ReactiveFormsModule, InputTextModule, ButtonModule, CardModule],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent {
	errorMessage: string = '';

	private readonly fb = inject(FormBuilder);
	private readonly authService = inject(AuthService);
	private readonly router = inject(Router);

	loginForm = this.fb.group({
		email: ['', [Validators.required, Validators.email]],
		password: ['', Validators.required],
	});

	login() {
		if (this.loginForm.valid) {
			const { email, password } = this.loginForm.value;
      if (!email || !password) {
        return;
      }
			this.authService.login(email, password).subscribe({
				next: (res) => {
					localStorage.setItem('token', (res as any).token);
					this.router.navigate(['/protected']);
				},
				error: (err) => {
					this.errorMessage = 'Invalid email or password';
					console.error('Login error', err);
				},
			});
		}
	}
}
