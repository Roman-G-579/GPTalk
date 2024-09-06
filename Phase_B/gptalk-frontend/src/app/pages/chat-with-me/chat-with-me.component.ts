import { ChangeDetectionStrategy, Component, inject, signal, WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { LottieComponent, AnimationOptions } from 'ngx-lottie';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { ChatWithMeService } from './chat-with-me.service';
import { Chat } from './interfaces/chat.interface';
import { ChatResponse } from './interfaces/chat-response.interface';
import { Grade } from './interfaces/grade.interface';
import { LanguageSelectComponent } from '../../core/common/language-select/language-select.component';
import { Language } from '../../core/enums/language.enum';

@Component({
	selector: 'app-chat-with-me',
	standalone: true,
	imports: [
		CommonModule,
		LottieComponent,
		FormsModule,
		InputTextModule,
		ButtonModule,
		ConfirmDialogModule,
    LanguageSelectComponent,
	],
	providers: [ConfirmationService],
	templateUrl: './chat-with-me.component.html',
	styleUrl: './chat-with-me.component.scss',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChatWithMeComponent {
	private readonly chatWithMeService = inject(ChatWithMeService);
	private readonly toastrService = inject(ToastrService);
	private readonly confirmationService = inject(ConfirmationService);
	private readonly router = inject(Router);

	language: WritableSignal<Language | ''> = signal('');
	conversation = signal<Chat[]>([]);

	loading = signal(false);
	gradeLoading = signal(false);

	textContent = '';

	noMessagesOptions: AnimationOptions = {
		path: '/assets/lottie/no-messages.json',
	};

	chat() {
		this.loading.set(true);
		this.conversation.update((values) => [...values, { role: 'user', content: this.textContent }])
			this.chatWithMeService
				.chat(this.textContent, this.language(), this.conversation())
				.pipe(finalize(() => this.loading.set(false)))
				.subscribe({
					next: (response: ChatResponse) => {
						const content = `${response.feedback}.\n${response.followUpQuestion}
          `;
						this.conversation.update((values) => [...values, { role: 'system', content }]);
						this.textContent = '';
					},
          error: () => this.toastrService.error('Chat error occured!', 'Error!'),
        });
	}

	grade() {
		if (!this.conversation().length) {
			return;
		}
		this.loading.set(true);
		this.gradeLoading.set(true);
		this.chatWithMeService.grade(this.language(), this.conversation()).subscribe({
			next: (val: Grade) => {
				this.openDialog(val);
			},
			error: () => this.toastrService.error('Error occured!', 'Error!'),
		});
	}

	openDialog(grade: Grade) {
    console.log(grade);
		this.confirmationService.confirm({
			header: 'Session Grade',
			message: `Your grade is: ${grade.grade}! ${grade.grade > 70 ? 'Good Job!' : 'Better luck next time!'}`,
			accept: () => {
        this.setLanguage('');
				this.conversation.set([]);
			},
			reject: () => {
				this.router.navigateByUrl('pages/home');
			},
		});
	}

	setLanguage(lang: Language | '') {
		this.language.set(lang);
	}
}
