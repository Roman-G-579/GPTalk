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
import { ChatWithMeService } from './chat-with-me.service';
import { Chat } from './interfaces/chat.interface';
import { ChatResponse } from './interfaces/chat-response.interface';
import { Grade } from './interfaces/grade.interface';
import { ConfirmationService } from 'primeng/api';

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

	//! TODO: Change to enum
	language: WritableSignal<'English' | 'Spanish' | 'Russian' | 'Hebrew' | ''> = signal('');
	conversation = signal<Chat[]>([]);
	loading = signal(false);
	gradeLoading = signal(false);

	textContent = '';

	noMessagesOptions: AnimationOptions = {
		path: '/assets/lottie/no-messages.json',
	};

	languages: { language: 'English' | 'Spanish' | 'Russian' | 'Hebrew'; img: string }[] = [
		{
			language: 'English',
			img: 'assets/languages/english.png',
		},
		{
			language: 'Spanish',
			img: 'assets/languages/spanish.png',
		},
		{
			language: 'Russian',
			img: 'assets/languages/russian.png',
		},
		{
			language: 'Hebrew',
			img: 'assets/languages/hebrew.png',
		},
	];

	chat() {
		this.loading.set(true);
		this.conversation.update((values) => [...values, { role: 'user', content: this.textContent }]),
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
			message: `Your grade is: ${grade.grade}! ${grade.grade > 70 ? 'Good Job!' : 'Better next time!'}`,
			accept: () => {
        this.setLanguage('');
				this.conversation.set([]);
			},
			reject: () => {
				this.router.navigateByUrl('pages/home');
			},
		});
	}

	setLanguage(lang: 'English' | 'Spanish' | 'Russian' | 'Hebrew' | '') {
		this.language.set(lang);
	}
}
