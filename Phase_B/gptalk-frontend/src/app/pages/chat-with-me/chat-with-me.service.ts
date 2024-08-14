import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Chat } from './interfaces/chat.interface';
import { environment } from 'src/environments/environment';
import { ChatResponse } from './interfaces/chat-response.interface';
import { Grade } from './interfaces/grade.interface';

@Injectable({
	providedIn: 'root',
})
export class ChatWithMeService {
	private readonly http = inject(HttpClient);
	private readonly apiUrl = `${environment.apiUrl}`;

	chat(
		userPrompt: string,
		language: 'English' | 'Spanish' | 'Russian' | 'Hebrew' | '',
		conversation: Chat[],
	) {
		const { href } = new URL('chat-with-me/chat', this.apiUrl);
		return this.http.post<ChatResponse>(href, { userPrompt, language, conversation });
	}

	grade(language: 'English' | 'Spanish' | 'Russian' | 'Hebrew' | '', conversation: Chat[]) {
		const { href } = new URL('chat-with-me/grade', this.apiUrl);
		return this.http.post<Grade>(href, { language, conversation });
	}
}
