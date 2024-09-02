import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LeadboardRow } from './leaderboard.interface';

@Injectable({
	providedIn: 'root',
})
export class LeaderboardService {
	private readonly http = inject(HttpClient);
	private readonly apiUrl = `${environment.apiUrl}`;

	getLeaderboard(): Observable<{ top3Users: LeadboardRow[]; top4To10Users: LeadboardRow[] }> {
		const { href } = new URL(`leaderboard`, this.apiUrl);
		return this.http.get<{ top3Users: LeadboardRow[]; top4To10Users: LeadboardRow[] }>(href);
	}
}
