import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { finalize } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { LottieComponent, AnimationOptions } from 'ngx-lottie';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { DialogService, DynamicDialogModule, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ChatWithMeService } from './chat-with-me.service';
import { Chat } from './interfaces/chat.interface';
import { ChatResponse } from './interfaces/chat-response.interface';
import { GradeDialogComponent } from './grade-dialog/grade-dialog.component';
import { Router } from '@angular/router';
import { Grade } from './interfaces/grade.interface';

@Component({
	selector: 'app-chat-with-me',
	standalone: true,
	imports: [
		CommonModule,
		LottieComponent,
		FormsModule,
		InputTextModule,
		ButtonModule,
		DynamicDialogModule,
	],
	providers: [DialogService],
	templateUrl: './chat-with-me.component.html',
	styleUrl: './chat-with-me.component.scss',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChatWithMeComponent {
	private readonly chatWithMeService = inject(ChatWithMeService);
	private readonly toastrService = inject(ToastrService);
	private readonly dialogService = inject(DialogService);
	private readonly router = inject(Router);

	//! TODO: Change to enum
	language: 'English' | 'Spanish' | 'Russian' | 'Hebrew' = 'English';
	conversation = signal<Chat[]>([]);
	loading = signal(false);
	gradeLoading = signal(false);

	textContent = '';

	ref: DynamicDialogRef | undefined;

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

	grade() {
		if (!this.conversation.length) {
			return;
		}
		this.loading.set(true);
		this.gradeLoading.set(true);
		this.chatWithMeService.grade(this.language, this.conversation()).subscribe({
			next: (val: Grade) => {
				this.openDialog(val);
			},
			error: () => this.toastrService.error('Error occured!', 'Error!'),
		});
	}

	openDialog(grade: Grade) {
		this.ref = this.dialogService.open(GradeDialogComponent, {
			header: 'Session Grade',
			data: {
				grade,
			},
		});

		this.ref.onClose.subscribe((response: 'new' | 'home') => {
			if (response === 'new') {
				this.conversation.set([]);
			} else {
				this.router.navigateByUrl('pages/home');
			}
		});
	}
}
