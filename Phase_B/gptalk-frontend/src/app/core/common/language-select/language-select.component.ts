import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Output } from '@angular/core';
import { Language } from '../../enums/language.enum';

@Component({
	selector: 'app-language-select',
	standalone: true,
	imports: [CommonModule],
	templateUrl: './language-select.component.html',
	styleUrl: './language-select.component.scss',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LanguageSelectComponent {
  @Output() languageSelectionEvent = new EventEmitter<Language>();

	languages: { language: Language; img: string }[] = [
		{
			language: Language.English,
			img: 'assets/languages/english.png',
		},
		{
			language: Language.Spanish,
			img: 'assets/languages/spanish.png',
		},
		{
			language: Language.Russian,
			img: 'assets/languages/russian.png',
		},
		{
			language: Language.Hebrew,
			img: 'assets/languages/hebrew.png',
		},
	];

	setLanguage(language: Language) {
    this.languageSelectionEvent.emit(language);
  }
}
