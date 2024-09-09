import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Chat } from './interfaces/chat.interface';
import { environment } from '../../../environments/environment';
import { ChatResponse } from './interfaces/chat-response.interface';
import { Grade } from './interfaces/grade.interface';
import { Language } from '../../core/enums/language.enum';

@Injectable({
	providedIn: 'root',
})
export class ChatWithMeService {
	private readonly http = inject(HttpClient);
	private readonly apiUrl = `${environment.apiUrl}`;

	chat(userPrompt: string, language: Language, conversation: Chat[]) {
		const { href } = new URL('chat-with-me/chat', this.apiUrl);
		return this.http.post<ChatResponse>(href, { userPrompt, language, conversation });
	}

	grade(language: Language, conversation: Chat[]) {
		const { href } = new URL('chat-with-me/grade', this.apiUrl);
		return this.http.post<Grade>(href, { language, conversation });
	}
}
