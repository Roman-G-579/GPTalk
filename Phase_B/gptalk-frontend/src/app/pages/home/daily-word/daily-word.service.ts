import {inject, Injectable, signal} from '@angular/core';
import {environment} from '../../../../environments/environment';
import {HttpClient} from '@angular/common/http';
import {Language} from '../../../core/enums/language.enum';
import {DailyWord} from './daily-word.interface';

@Injectable({
	providedIn: 'root',
})
export class DailyWordService {
	private readonly apiUrl = environment.apiUrl;
	private readonly http = inject(HttpClient);

	dailyWord = signal<DailyWord>({
		word: '',
		definition: '',
		example: '',
		translation: '',
    language: Language.English,
    translationLanguage: Language.Hebrew
	});

  language = signal<Language>(Language.English);
  translationLanguage = signal<Language>(Language.Hebrew);

	isLoading = signal<boolean>(true);

	/**
	 * Sends a request to the backend to fetch the daily word
	 * If on does not exist for the current date, a new one will be generated
	 * @returns an observable of the response JSON
	 */
	async getDailyWord() {
		const { href } = new URL('daily-word/fetch', this.apiUrl);

		this.http.post<DailyWord>(href, { date: new Date() }).subscribe({
			next: (data: DailyWord) => {
				this.dailyWord.set(data);
        this.language.set(data.language);
        this.translationLanguage.set(data.translationLanguage);
				this.isLoading.set(false);
			},
			error: (err: unknown) => {
				console.error('Error fetching daily word', err);
			},
		});
	}
}
