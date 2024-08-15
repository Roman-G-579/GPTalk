import { inject, Injectable, signal } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Language } from '../../../../models/enums/language.enum';
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

  /**
   * Sends a request to the backend to fetch the daily word
   * If on does not exist for the current date, a new one will be generated
   * @returns an observable of the API's response JSON
   */
  async getDailyWord() {
    let {href} = new URL('daily-word/fetch', this.apiUrl);

    this.http.post<DailyWord>(href, { date: new Date() }).subscribe({
      next: (data: DailyWord) => {
          this.dailyWord.set(data);
      },
      error: (err: unknown) => {
        console.log('Error fetching daily word', err);
      }
    });
  }
}
