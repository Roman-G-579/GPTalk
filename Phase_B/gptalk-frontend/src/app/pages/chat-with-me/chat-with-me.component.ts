import {ChangeDetectionStrategy, Component, inject, signal, WritableSignal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {Router} from '@angular/router';
import {FormsModule} from '@angular/forms';
import {finalize} from 'rxjs';
import {ToastrService} from 'ngx-toastr';
import {AnimationOptions, LottieComponent} from 'ngx-lottie';
import {InputTextModule} from 'primeng/inputtext';
import {ButtonModule} from 'primeng/button';
import {ConfirmDialogModule} from 'primeng/confirmdialog';
import {ConfirmationService} from 'primeng/api';
import {ChatWithMeService} from './chat-with-me.service';
import {Chat} from './interfaces/chat.interface';
import {ChatResponse} from './interfaces/chat-response.interface';
import {Grade} from './interfaces/grade.interface';
import {LanguageSelectComponent} from '../../core/common/language-select/language-select.component';
import {Language} from '../../core/enums/language.enum';
import {LearnHtmlUtils} from "../learn/utils/learn-html.utils";

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
  protected readonly utilHtml = LearnHtmlUtils;
  private readonly chatWithMeService = inject(ChatWithMeService);
	private readonly toastrService = inject(ToastrService);
	private readonly confirmationService = inject(ConfirmationService);
	private readonly router = inject(Router);
  protected readonly Language = Language;

  language: WritableSignal<Language> = signal(Language.NOT_SELECTED);
	conversation = signal<Chat[]>([]);

	loading = signal(false);
	gradeLoading = signal(false);

	textContent = '';

	noMessagesOptions: AnimationOptions = {
		path: '/assets/lottie/no-messages.json',
	};

  promptButtons: {value: string, prompt: string}[] = []

  /**
   * Sends the message within textContent along with the session language and the conversation history
   * to the OpenAI API and retrieves a response based on the conversation up to this point
   */
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

  /**
   * Finishes the session and grades the user's messages for the current session
   */
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

  /**
   * Opens a dialog window displaying the grade given to the user for the current session
   * @param grade the grade (1 to 100) given by the chatbot
   */
	openDialog(grade: Grade) {
		this.confirmationService.confirm({
			header: 'Session Grade',
			message: `Your grade is: ${grade.grade}! ${grade.grade > 70 ? 'Good Job!' : 'Better luck next time!'}`,
			accept: () => {
        this.setLanguage(Language.NOT_SELECTED);
				this.conversation.set([]);
			},
			reject: () => {
				this.router.navigateByUrl('pages/home');
			},
		});
	}

  /**
   * Sets the chat session's language
   * @param lang the language of the session
   */
	setLanguage(lang: Language) {
		this.language.set(lang);

    // Initializes the prompt buttons once a language has been set
    this.setPromptButtons();
	}

  /**
   * Sets the initial values of the prompt buttons that appear at the start of the session
   */
  setPromptButtons() {
    this.promptButtons.push(
      {
        value: 'Teach me vocabulary',
        prompt: `Give me a lesson in vocabulary in ${this.language()}`
      },
      {
        value: `Let's do conversation practice`,
        prompt: `I want us to practice a dialogue in ${this.language()}. Start a conversation in that language.`
      },
      {
        value: `I want something translated`,
        prompt: `I want you to translate something from ${this.language()} to ${this.language() == Language.English ? Language.Hebrew : Language.English}.`
      },
      {
        value: `Do you have some learning tips?`,
        prompt: `Please give a tip for learning ${this.language()}.`
      }
    )
  }

  /**
   * Sends a chat message to the chatbot using the chosen prompt as a message
   * @param prompt the opening message for the session
   */
  sendInitialPrompt(prompt: string) {
    this.textContent = prompt;
    this.chat();
  }
}

