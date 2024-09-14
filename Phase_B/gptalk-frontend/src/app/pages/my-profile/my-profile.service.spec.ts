import { TestBed } from '@angular/core/testing';
import { MyProfileService } from './my-profile.service';
import { UserProfile } from './interfaces/user-profile.interface';
import { AuthService } from '../../core/services/auth.service';
import { environment } from '../../../environments/environment';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

class MockAuthService {
	userData() {
		return {
			email: 'test@example.com',
		};
	}
}

describe('MyProfileService', () => {
	let myProfileService: MyProfileService;
	let mockAuthService: MockAuthService;
	let httpMock: HttpTestingController;

	beforeEach(() => {
		mockAuthService = new MockAuthService();

		TestBed.configureTestingModule({
			imports: [HttpClientTestingModule],
			providers: [MyProfileService, { provide: AuthService, useClass: MockAuthService }],
		});

		myProfileService = TestBed.inject(MyProfileService);
		httpMock = TestBed.inject(HttpTestingController);
		mockAuthService = TestBed.inject(AuthService) as unknown as MockAuthService;
	});

	afterEach(() => {
		httpMock.verify();
	});

	it('should be created', () => {
		expect(myProfileService).toBeTruthy();
	});

	it('should call http.get with the correct URL', () => {
		const email = mockAuthService.userData().email;
		const expectedUrl = `${environment.apiUrl}profile/${email}`;

		// Simulates a call to the getUserProfile method
		// and checks that a value is returned
		myProfileService.getUserProfile().subscribe((profile) => {
			expect(profile).toBeTruthy();
		});

		// Check that the correct request method was used
		const req = httpMock.expectOne(expectedUrl);
		expect(req.request.method).toBe('GET');

		req.flush({} as UserProfile);
	});

	it('should return user profile data from http.get', (done) => {
		const mockProfile: UserProfile = {
			achievements: [],
			bio: '',
			lessonsCompleted: 0,
			country: '',
			createdAt: '',
			email: '',
			firstName: '',
			languages: [],
			lastName: '',
			latestResults: [],
			level: 0,
			maxStreak: 0,
			password: '',
			streak: 0,
			topPercentage: 0,
			totalExp: 0,
			username: '',
		};
		const email = mockAuthService.userData().email;
		const expectedUrl = `${environment.apiUrl}profile/${email}`;

		myProfileService.getUserProfile().subscribe((profile) => {
			expect(profile).toEqual(mockProfile);
			done();
		});

		const req = httpMock.expectOne(expectedUrl);
		expect(req.request.method).toBe('GET');

		req.flush(mockProfile);
	});
});
