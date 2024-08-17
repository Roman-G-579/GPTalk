import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Output } from '@angular/core';

@Component({
	selector: 'app-language-select',
	standalone: true,
	imports: [CommonModule],
	templateUrl: './language-select.component.html',
	styleUrl: './language-select.component.scss',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LanguageSelectComponent {
  @Output() languageSelectionEvent = new EventEmitter<'English' | 'Spanish' | 'Russian' | 'Hebrew' | ''>();

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

	setLanguage(language: 'English' | 'Spanish' | 'Russian' | 'Hebrew' | '') {
    this.languageSelectionEvent.emit(language);
  }
}
