import { inject, Injectable, signal } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Language } from '../../../core/enums/language.enum';
import { DailyWord } from './daily-word.interface';

@Injectable({
  providedIn: 'root'
})
export class DailyWordService {

  private readonly apiUrl = environment.apiUrl;
  private readonly http = inject(HttpClient);

  dailyWord = signal<DailyWord>({
    word: "",
    language: Language.English,
    definition: "",
    example: "",
    translation: ""
  });
  isLoading = signal<boolean>(true);


  /**
   * Sends a request to the backend to fetch the daily word
   * If on does not exist for the current date, a new one will be generated
   * @returns an observable of the API's response JSON
   */
  async getDailyWord() {
    const {href} = new URL('daily-word/fetch', this.apiUrl);

    this.http.post<DailyWord>(href, { date: new Date() }).subscribe({
      next: (data: DailyWord) => {
          this.dailyWord.set(data);
          this.isLoading.set(false);
      },
      error: (err: unknown) => {
        console.error('Error fetching daily word', err);
      }
    });
  }
}
