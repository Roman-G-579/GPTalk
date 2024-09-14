import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LeadboardRow } from './leaderboard.interface';
import { Language } from '../../core/enums/language.enum';

@Injectable({
	providedIn: 'root',
})
export class LeaderboardService {
	private readonly http = inject(HttpClient);
	private readonly apiUrl = `${environment.apiUrl}`;

	/**
	 * Sends a request to the backend to fetch the leaderboard
	 * @returns an observable of the retrieved LeaderboardRow object
	 */
	getLeaderboard(
		language: Language,
	): Observable<{ top3Users: LeadboardRow[]; top4To10Users: LeadboardRow[] }> {
		const headers = new HttpHeaders().set('language', language);
		const { href } = new URL(`leaderboard`, this.apiUrl);
		return this.http.get<{ top3Users: LeadboardRow[]; top4To10Users: LeadboardRow[] }>(href, {
			headers,
		});
	}
}
