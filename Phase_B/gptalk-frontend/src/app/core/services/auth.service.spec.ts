import { AuthService } from './auth.service';
import { UserResponse } from '../interfaces/user-response.interface';
import { environment } from '../../../environments/environment';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

describe('AuthService', () => {
	let authService: AuthService;
	let httpMock: HttpTestingController;

	// Used by login and fetchUserData tests
	const mockResponse = {
		token: 'mockToken',
		user: {
			__v: 1,
			_id: 'user123',
			createdAt: new Date(),
			email: 'test@example.com',
			firstName: 'John',
			lastName: 'Doe',
			username: 'johndoe',
			userAvatar: 'avatar.png',
			totalExp: 200,
		} as UserResponse,
	};

	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [HttpClientTestingModule],
			providers: [AuthService],
		});

		authService = TestBed.inject(AuthService);
		httpMock = TestBed.inject(HttpTestingController);
	});

	afterEach(() => {
		httpMock.verify(); // Verify that there are no outstanding requests
	});

	describe('login', () => {
		it('should call the login endpoint and update userData and totalExp on success', () => {
			const email = 'test@example.com';
			const password = 'password123';

			authService.login(email, password).subscribe(() => {
				expect(authService.userData()).toEqual(mockResponse.user);
				expect(authService.totalExp()).toEqual(200);
			});

			const req = httpMock.expectOne(`${environment.apiUrl}auth/login`);
			expect(req.request.method).toBe('POST');
			expect(req.request.body).toEqual({ email, password });
			req.flush(mockResponse);
		});

		it('should handle error when login fails', () => {
			const email = 'test@example.com';
			const password = 'wrongpassword';
			const mockError = new ErrorEvent('Network error', {
				message: 'Invalid credentials',
			});

			authService.login(email, password).subscribe({
				next: () => fail('expected an error'),
				error: (error) => {
					expect(error.error.message).toContain('Invalid credentials');
				},
			});

			const req = httpMock.expectOne(`${environment.apiUrl}auth/login`);
			expect(req.request.method).toBe('POST');
			req.error(mockError);
		});
	});

	describe('fetchUserData', () => {
		it('should call the user endpoint and update userData and totalExp on success', () => {
			const token = 'mockToken';

			authService.fetchUserData(token).subscribe(() => {
				expect(authService.userData()).toEqual(mockResponse);
				expect(authService.totalExp()).toEqual(200);
			});

			const req = httpMock.expectOne(`${environment.apiUrl}auth/user`);
			expect(req.request.method).toBe('GET');
			expect(req.request.headers.get('Authorization')).toBe(`Bearer ${token}`);
			req.flush(mockResponse);
		});

		it('should handle error when fetchUserData fails', () => {
			const token = 'mockToken';
			const mockError = new ErrorEvent('Network error', {
				message: 'Failed to fetch user data',
			});

			authService.fetchUserData(token).subscribe({
				next: () => fail('expected an error'),
				error: (error) => {
					expect(error.error.message).toContain('Failed to fetch user data');
				},
			});

			const req = httpMock.expectOne(`${environment.apiUrl}auth/user`);
			expect(req.request.method).toBe('GET');
			req.error(mockError);
		});
	});

	describe('logout', () => {
		it('should clear userData and remove token from localStorage', () => {
			const spyRemoveItem = jest
				.spyOn(Storage.prototype, 'removeItem')
				.mockImplementation(() => {});

			authService.logout();

			expect(authService.userData()).toEqual({
				__v: 0,
				_id: '',
				createdAt: expect.any(Date),
				email: '',
				firstName: '',
				lastName: '',
				username: '',
				userAvatar: '',
			});
			expect(spyRemoveItem).toHaveBeenCalledWith('token');
		});
	});
});
