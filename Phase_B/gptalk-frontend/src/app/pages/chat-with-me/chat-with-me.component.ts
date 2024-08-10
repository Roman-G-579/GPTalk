import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { finalize } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { LottieComponent, AnimationOptions } from 'ngx-lottie';
import { ChatWithMeService } from './chat-with-me.service';
import { Chat } from './interfaces/chat.interface';
import { ChatResponse } from './interfaces/chat-response.interface';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { BypassSecurityPipe } from 'src/pipes/bypass-security.pipe';

@Component({
	selector: 'app-chat-with-me',
	standalone: true,
	imports: [CommonModule, LottieComponent, FormsModule, InputTextModule, ButtonModule, BypassSecurityPipe],
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

	textContent = '';

	noMessagesOptions: AnimationOptions = {
		path: '/assets/lottie/no-messages.json',
	};

	chat() {
		this.loading.set(true);
		this.conversation.update((values) => [...values, { role: 'user', content: this.textContent }]),
			this.chatWithMeService
				.chat(this.textContent, this.language, this.conversation())
				.pipe(finalize(() => this.loading.set(false)))
				.subscribe({
					next: (response: ChatResponse) => {
						const content = `${response.feedback}.\n${response.followUpQuestion}
          `;
						this.conversation.update((values) => [...values, { role: 'system', content }]);
						this.textContent = '';
					},
				});
	}

	grade() {}
}
