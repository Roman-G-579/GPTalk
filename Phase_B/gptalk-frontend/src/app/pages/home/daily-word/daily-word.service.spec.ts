import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { DailyWordService } from './daily-word.service';
import { environment } from '../../../../environments/environment';
import { DailyWord } from './daily-word.interface';
import { Language } from '../../../core/enums/language.enum';

describe('DailyWordService', () => {
	let dailyWordService: DailyWordService;
	let httpMock: HttpTestingController;

	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [HttpClientTestingModule],
			providers: [DailyWordService],
		});

		dailyWordService = TestBed.inject(DailyWordService);
		httpMock = TestBed.inject(HttpTestingController);
	});

	afterEach(() => {
		httpMock.verify(); // Ensure that no requests are outstanding
	});

	it('should send a POST request to fetch the daily word', async () => {
		const mockDailyWord: DailyWord = {
			word: 'example',
			language: Language.Spanish,
			translationLanguage: Language.English,
			definition: 'A sample definition',
			example: 'This is an example sentence.',
			translation: 'ejemplo',
		};

		// Call the method and assert HTTP request
		await dailyWordService.getDailyWord();

		const req = httpMock.expectOne(`${environment.apiUrl}daily-word/fetch`);
		expect(req.request.method).toBe('POST');
		expect(req.request.body).toEqual({ date: expect.any(Date) });

		// Simulate the response from the backend
		req.flush(mockDailyWord);

		expect(dailyWordService.dailyWord()).toEqual(mockDailyWord);
	});

	it('should handle error when fetching the daily word', async () => {
		const consoleSpy = jest.spyOn(console, 'error');
		await dailyWordService.getDailyWord();

		const req = httpMock.expectOne(`${environment.apiUrl}daily-word/fetch`);
		expect(req.request.method).toBe('POST');
		expect(req.request.body).toEqual({ date: expect.any(Date) });

		// Simulate an error response from the backend
		req.flush('Error fetching daily word', { status: 500, statusText: 'Internal Server Error' });

		// Verify that the error has been logged to the console
		expect(consoleSpy).toHaveBeenCalledWith('Error fetching daily word', expect.any(Object));
	});
});
