import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { TagModule } from 'primeng/tag';
import { Language } from './language.interface';

@Component({
	selector: 'app-profile-languages',
	standalone: true,
	imports: [CommonModule, TagModule],
	templateUrl: './profile-languages.component.html',
	styleUrl: './profile-languages.component.scss',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileLanguagesComponent {
	languageIconRecord: Record<string, string> = {
		English: 'assets/profile/languages/english.png',
		Spanish: 'assets/profile/languages/spanish.png',
		Russian: 'assets/profile/languages/russian.png',
		Hebrew: 'assets/profile/languages/hebrew.png',
	};

	languageRankClassRecord: Record<string, 'success' | 'info' | 'danger'> = {
		Novice: 'success',
		Expert: 'info',
		Master: 'danger',
	};

	languages = input<Language[]>();
}
