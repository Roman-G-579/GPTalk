import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { finalize } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { ChatWithMeService } from './chat-with-me.service';
import { Chat } from './interfaces/chat.interface';
import { ChatResponse } from './interfaces/chat-response.interface';

@Component({
	selector: 'app-chat-with-me',
	standalone: true,
	imports: [CommonModule],
	templateUrl: './chat-with-me.component.html',
	styleUrl: './chat-with-me.component.scss',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChatWithMeComponent {
	private readonly chatWithMeService = inject(ChatWithMeService);
	private readonly toastrService = inject(ToastrService);
	//! TODO: Change to enum
	language: 'English' | 'Spanish' | 'Russian' | 'Hebrew' = 'English';
	conversation = signal<Chat[]>([]);
	loading = signal(false);

	chat(userPrompt: string) {
		this.loading.set(true);
		this.chatWithMeService
			.chat(userPrompt, this.language, this.conversation())
			.pipe(finalize(() => this.loading.set(false)))
			.subscribe({
				next: (response: ChatResponse) => {
					const content = `${response.feedback}
          ${response.followUpQuestion}
          `;
					this.conversation.update((values) => [
						...values,
						{ role: 'user', content: userPrompt },
						{ role: 'system', content },
					]);
				},
			});
	}
}
